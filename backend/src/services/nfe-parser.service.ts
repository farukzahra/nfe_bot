import { XMLParser } from 'fast-xml-parser'

export interface ParsedParty {
  documentNumber: string | null
  legalName: string | null
  tradeName: string | null
  stateRegistration: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export interface ParsedTax {
  taxType: string
  cst: string | null
  csosn: string | null
  baseAmount: number | null
  rate: number | null
  taxAmount: number | null
}

export interface ParsedItem {
  productCode: string | null
  ean: string | null
  description: string | null
  ncm: string | null
  cfop: string | null
  unit: string | null
  quantity: number | null
  unitPrice: number | null
  totalPrice: number | null
  discountAmount: number | null
  freightAmount: number | null
  taxAmount: number | null
  taxes: ParsedTax[]
}

export interface ParsedNFe {
  accessKey: string | null
  documentNumber: string | null
  series: string | null
  model: string | null
  direction: 'entrada' | 'saida' | null
  operationType: string | null
  issueDate: Date | null
  exitDate: Date | null
  status: 'autorizada' | 'cancelada' | 'denegada' | 'inutilizada' | null
  totalAmount: number | null
  productsAmount: number | null
  discountAmount: number | null
  freightAmount: number | null
  taxAmount: number | null
  issuer: ParsedParty
  recipient: ParsedParty | null
  items: ParsedItem[]
  docTaxes: Omit<ParsedTax, 'cst' | 'csosn' | 'rate'>[]
}

function str(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null
  return String(v)
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function date(v: unknown): Date | null {
  if (!v) return null
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? null : d
}

function addr(ender: Record<string, unknown>): string | null {
  return (
    [str(ender.xLgr), str(ender.nro), str(ender.xBairro)].filter(Boolean).join(', ') || null
  )
}

const ICMS_TAGS = [
  'ICMS00', 'ICMS10', 'ICMS20', 'ICMS30', 'ICMS40', 'ICMS51',
  'ICMS60', 'ICMS70', 'ICMS90',
  'ICMSSN101', 'ICMSSN102', 'ICMSSN201', 'ICMSSN202', 'ICMSSN500', 'ICMSSN900',
]

export class NFeParserService {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      parseTagValue: false,
      isArray: (name) => name === 'det',
      trimValues: true,
    })
  }

  parse(xmlContent: string): ParsedNFe {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = this.parser.parse(xmlContent)

    const nfe = doc.nfeProc?.NFe ?? doc.NFe
    if (!nfe) throw new Error('INVALID_XML: NFe not found')

    const infNFe = nfe.infNFe
    if (!infNFe) throw new Error('INVALID_XML: infNFe not found')

    const ide = infNFe.ide ?? {}
    const emitRaw = infNFe.emit ?? {}
    const destRaw = infNFe.dest ?? null
    const det: unknown[] = Array.isArray(infNFe.det)
      ? infNFe.det
      : infNFe.det
        ? [infNFe.det]
        : []
    const icmsTot = infNFe.total?.ICMSTot ?? {}
    const prot = doc.nfeProc?.protNFe?.infProt ?? null

    // Access key
    const idAttr = str(infNFe['@_Id']) ?? ''
    const accessKey = idAttr.startsWith('NFe')
      ? idAttr.slice(3)
      : str(prot?.chNFe) ?? str(idAttr) ?? null

    // Direction
    const tpNF = str(ide.tpNF)
    const direction: 'entrada' | 'saida' | null =
      tpNF === '0' ? 'entrada' : tpNF === '1' ? 'saida' : null

    // Status
    let status: ParsedNFe['status'] = null
    if (prot) {
      const cStat = str(prot.cStat)
      if (cStat === '100') status = 'autorizada'
      else if (['101', '151'].includes(cStat ?? '')) status = 'cancelada'
      else if (['110', '301', '302'].includes(cStat ?? '')) status = 'denegada'
    } else {
      status = 'autorizada'
    }

    // Parties
    const enderEmit = emitRaw.enderEmit ?? {}
    const issuer: ParsedParty = {
      documentNumber: str(emitRaw.CNPJ ?? emitRaw.CPF),
      legalName: str(emitRaw.xNome),
      tradeName: str(emitRaw.xFant),
      stateRegistration: str(emitRaw.IE),
      address: addr(enderEmit),
      city: str(enderEmit.xMun),
      state: str(enderEmit.UF),
      zipCode: str(enderEmit.CEP),
    }

    let recipient: ParsedParty | null = null
    if (destRaw) {
      const enderDest = destRaw.enderDest ?? {}
      recipient = {
        documentNumber: str(destRaw.CNPJ ?? destRaw.CPF),
        legalName: str(destRaw.xNome),
        tradeName: null,
        stateRegistration: str(destRaw.IE),
        address: addr(enderDest),
        city: str(enderDest.xMun),
        state: str(enderDest.UF),
        zipCode: str(enderDest.CEP),
      }
    }

    // Items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: ParsedItem[] = (det as any[]).map((d) => {
      const prod = d.prod ?? {}
      const imposto = d.imposto ?? {}
      const taxes: ParsedTax[] = []

      // ICMS
      const icmsGroup = imposto.ICMS ?? {}
      const icmsInner = ICMS_TAGS.map((t) => icmsGroup[t]).find(Boolean) ?? {}
      if (Object.keys(icmsInner).length > 0) {
        taxes.push({
          taxType: 'ICMS',
          cst: str(icmsInner.CST),
          csosn: str(icmsInner.CSOSN),
          baseAmount: num(icmsInner.vBC),
          rate: num(icmsInner.pICMS),
          taxAmount: num(icmsInner.vICMS),
        })
      }

      // PIS
      const pisInner =
        imposto.PIS?.PISAliq ?? imposto.PIS?.PISQtde ?? imposto.PIS?.PISNT ?? imposto.PIS?.PISOutr ?? {}
      if (Object.keys(pisInner).length > 0) {
        taxes.push({
          taxType: 'PIS',
          cst: str(pisInner.CST),
          csosn: null,
          baseAmount: num(pisInner.vBC),
          rate: num(pisInner.pPIS),
          taxAmount: num(pisInner.vPIS),
        })
      }

      // COFINS
      const cofinsInner =
        imposto.COFINS?.COFINSAliq ??
        imposto.COFINS?.COFINSQtde ??
        imposto.COFINS?.COFINSNT ??
        imposto.COFINS?.COFINSOutr ??
        {}
      if (Object.keys(cofinsInner).length > 0) {
        taxes.push({
          taxType: 'COFINS',
          cst: str(cofinsInner.CST),
          csosn: null,
          baseAmount: num(cofinsInner.vBC),
          rate: num(cofinsInner.pCOFINS),
          taxAmount: num(cofinsInner.vCOFINS),
        })
      }

      // IPI
      const ipiInner = imposto.IPI?.IPITrib ?? imposto.IPI?.IPINT ?? {}
      if (Object.keys(ipiInner).length > 0) {
        taxes.push({
          taxType: 'IPI',
          cst: str(ipiInner.CST),
          csosn: null,
          baseAmount: num(ipiInner.vBC),
          rate: num(ipiInner.pIPI),
          taxAmount: num(ipiInner.vIPI),
        })
      }

      const ean = str(prod.cEAN)
      return {
        productCode: str(prod.cProd),
        ean: ean !== 'SEM GTIN' ? ean : null,
        description: str(prod.xProd),
        ncm: str(prod.NCM),
        cfop: str(prod.CFOP),
        unit: str(prod.uCom),
        quantity: num(prod.qCom),
        unitPrice: num(prod.vUnCom),
        totalPrice: num(prod.vProd),
        discountAmount: num(prod.vDesc),
        freightAmount: num(prod.vFrete),
        taxAmount: null,
        taxes,
      }
    })

    // Document-level totals taxes
    const docTaxes: ParsedNFe['docTaxes'] = []
    const addDocTax = (type: string, base: unknown, amount: unknown) => {
      if (num(amount)) docTaxes.push({ taxType: type, baseAmount: num(base), taxAmount: num(amount) })
    }
    addDocTax('ICMS', icmsTot.vBC, icmsTot.vICMS)
    addDocTax('ICMS_ST', icmsTot.vBCST, icmsTot.vST)
    addDocTax('IPI', null, icmsTot.vIPI)
    addDocTax('PIS', null, icmsTot.vPIS)
    addDocTax('COFINS', null, icmsTot.vCOFINS)

    return {
      accessKey,
      documentNumber: str(ide.nNF),
      series: str(ide.serie),
      model: str(ide.mod),
      direction,
      operationType: str(ide.natOp),
      issueDate: date(ide.dhEmi),
      exitDate: date(ide.dhSaiEnt),
      status,
      totalAmount: num(icmsTot.vNF),
      productsAmount: num(icmsTot.vProd),
      discountAmount: num(icmsTot.vDesc),
      freightAmount: num(icmsTot.vFrete),
      taxAmount: num(icmsTot.vTotTrib),
      issuer,
      recipient,
      items,
      docTaxes,
    }
  }
}
