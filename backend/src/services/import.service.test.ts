import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ImportService } from './import.service.js'
import type { PrismaClient } from '@prisma/client'

const xml1Content = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe41260313986197000121550010000000011000000017" versao="4.00">
      <ide><cUF>41</cUF><natOp>VENDA</natOp><mod>55</mod><serie>001</serie><nNF>1</nNF>
        <dhEmi>2026-06-27T10:00:00-03:00</dhEmi><tpNF>1</tpNF>
        <idDest>1</idDest><cMunFG>4106902</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis>
        <cDV>7</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal>
        <indPres>1</indPres><procEmi>0</procEmi><verProc>4.00</verProc>
      </ide>
      <emit>
        <CNPJ>13986197000121</CNPJ><xNome>EMPRESA EXEMPLO LTDA</xNome>
        <enderEmit><xLgr>RUA</xLgr><nro>1</nro><xBairro>CTR</xBairro>
          <cMun>4106902</cMun><xMun>CURITIBA</xMun><UF>PR</UF><CEP>80010000</CEP>
          <cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit>
        <IE>1234567890</IE><CRT>3</CRT>
      </emit>
      <dest>
        <CPF>12345678901</CPF><xNome>JOSE DA SILVA</xNome>
        <enderDest><xLgr>AV</xLgr><nro>1</nro><xBairro>JD</xBairro>
          <cMun>4106902</cMun><xMun>CURITIBA</xMun><UF>PR</UF><CEP>80020000</CEP>
          <cPais>1058</cPais><xPais>BRASIL</xPais></enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      <det nItem="1">
        <prod><cProd>P001</cProd><cEAN>7891234</cEAN><xProd>PRODUTO A</xProd>
          <NCM>84713012</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom>
          <vUnCom>100.0000</vUnCom><vProd>100.00</vProd><cEANTrib>7891234</cEANTrib>
          <uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>100.0000</vUnTrib>
          <vDesc>0.00</vDesc><indTot>1</indTot></prod>
        <imposto><ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>100.00</vBC><pICMS>12.0000</pICMS><vICMS>12.00</vICMS>
          </ICMS00></ICMS></imposto>
      </det>
      <total><ICMSTot><vBC>100.00</vBC><vICMS>12.00</vICMS><vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet><vProd>100.00</vProd><vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro><vNF>100.00</vNF><vTotTrib>12.00</vTotTrib>
      </ICMSTot></total>
      <transp><modFrete>9</modFrete></transp>
      <pag><detPag><tPag>01</tPag><vPag>100.00</vPag></detPag></pag>
    </infNFe>
  </NFe>
  <protNFe versao="4.00"><infProt><tpAmb>1</tpAmb><verAplic>V4</verAplic>
    <chNFe>41260313986197000121550010000000011000000017</chNFe>
    <dhRecbto>2026-06-27T10:05:00-03:00</dhRecbto><nProt>1</nProt>
    <digVal>abc</digVal><cStat>100</cStat>
    <xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe>
</nfeProc>`

function makeMockPrisma() {
  const docId = 'doc-uuid-1'
  const itemId = 'item-uuid-1'
  const batchId = 'batch-uuid-1'

  return {
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        fiscalDocument: { create: vi.fn().mockResolvedValue({ id: docId }) },
        fiscalParty: { create: vi.fn().mockResolvedValue({ id: 'party-1' }) },
        fiscalItem: { create: vi.fn().mockResolvedValue({ id: itemId }) },
        fiscalTax: { create: vi.fn().mockResolvedValue({ id: 'tax-1' }) },
      })
    }),
    importBatch: {
      create: vi.fn().mockResolvedValue({ id: batchId }),
      update: vi.fn().mockResolvedValue({ id: batchId }),
    },
    importError: {
      create: vi.fn().mockResolvedValue({ id: 'err-1' }),
    },
  } as unknown as PrismaClient
}

describe('ImportService', () => {
  let mockPrisma: PrismaClient
  let svc: ImportService

  beforeEach(() => {
    mockPrisma = makeMockPrisma()
    svc = new ImportService(mockPrisma)
  })

  describe('importXml', () => {
    it('retorna sucesso para XML válido', async () => {
      const result = await svc.importXml('user-1', '1.xml', xml1Content)

      expect(result.successCount).toBe(1)
      expect(result.errorCount).toBe(0)
      expect(result.totalFiles).toBe(1)
      expect(result.results[0].success).toBe(true)
      expect(result.results[0].documentId).toBeDefined()
    })

    it('cria importBatch com status completed', async () => {
      await svc.importXml('user-1', '1.xml', xml1Content)

      expect(mockPrisma.importBatch.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fileType: 'xml' }) }),
      )
      expect(mockPrisma.importBatch.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }),
      )
    })

    it('retorna erro e registra importError para XML inválido', async () => {
      const result = await svc.importXml('user-1', 'bad.xml', '<invalid/>')

      expect(result.successCount).toBe(0)
      expect(result.errorCount).toBe(1)
      expect(result.results[0].success).toBe(false)
      expect(result.results[0].error).toBeDefined()
      expect(mockPrisma.importError.create).toHaveBeenCalled()
    })
  })
})
