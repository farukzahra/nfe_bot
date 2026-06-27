import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NFeParserService } from './nfe-parser.service.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(__dirname, '../../../nfe_examples')

const xml1 = readFileSync(join(fixturesDir, '1.xml'), 'utf-8')
const xml2 = readFileSync(join(fixturesDir, '2.xml'), 'utf-8')

const parser = new NFeParserService()

describe('NFeParserService', () => {
  describe('parse — NF-e saída (1.xml)', () => {
    const nfe = parser.parse(xml1)

    it('extrai chave de acesso', () => {
      expect(nfe.accessKey).toBe('41260313986197000121550010000000011000000017')
    })

    it('classifica como saída', () => {
      expect(nfe.direction).toBe('saida')
    })

    it('extrai número e série', () => {
      expect(nfe.documentNumber).toBe('1')
      expect(nfe.series).toBe('001')
    })

    it('extrai modelo 55', () => {
      expect(nfe.model).toBe('55')
    })

    it('extrai status autorizada via protocolo', () => {
      expect(nfe.status).toBe('autorizada')
    })

    it('extrai data de emissão', () => {
      expect(nfe.issueDate).toBeInstanceOf(Date)
    })

    it('extrai totais', () => {
      expect(nfe.totalAmount).toBe(2790)
      expect(nfe.productsAmount).toBe(2800)
      expect(nfe.discountAmount).toBe(10)
    })

    it('extrai emitente', () => {
      expect(nfe.issuer.documentNumber).toBe('13986197000121')
      expect(nfe.issuer.legalName).toBe('EMPRESA EXEMPLO LTDA')
      expect(nfe.issuer.state).toBe('PR')
    })

    it('extrai destinatário', () => {
      expect(nfe.recipient).not.toBeNull()
      expect(nfe.recipient?.documentNumber).toBe('12345678901')
      expect(nfe.recipient?.legalName).toBe('JOSE DA SILVA')
    })

    it('extrai 2 itens', () => {
      expect(nfe.items).toHaveLength(2)
    })

    it('item 1 — dados corretos', () => {
      const item = nfe.items[0]
      expect(item.description).toBe('NOTEBOOK GAMER XYZ')
      expect(item.quantity).toBe(1)
      expect(item.unitPrice).toBe(2500)
      expect(item.totalPrice).toBe(2500)
      expect(item.cfop).toBe('5102')
    })

    it('item 1 — tem ICMS, PIS, COFINS', () => {
      const taxes = nfe.items[0].taxes
      const types = taxes.map((t) => t.taxType)
      expect(types).toContain('ICMS')
      expect(types).toContain('PIS')
      expect(types).toContain('COFINS')
    })

    it('item 2 — desconto', () => {
      expect(nfe.items[1].discountAmount).toBe(10)
    })

    it('tem impostos de documento (ICMS, PIS, COFINS)', () => {
      const types = nfe.docTaxes.map((t) => t.taxType)
      expect(types).toContain('ICMS')
      expect(types).toContain('PIS')
      expect(types).toContain('COFINS')
    })
  })

  describe('parse — NF-e entrada (2.xml)', () => {
    const nfe = parser.parse(xml2)

    it('classifica como entrada', () => {
      expect(nfe.direction).toBe('entrada')
    })

    it('extrai chave de acesso', () => {
      expect(nfe.accessKey).toBe('35260248740351000152550010000000021000000026')
    })

    it('emitente é o fornecedor', () => {
      expect(nfe.issuer.documentNumber).toBe('48740351000152')
      expect(nfe.issuer.legalName).toBe('FORNECEDOR TECH SA')
    })

    it('destinatário é a empresa', () => {
      expect(nfe.recipient?.documentNumber).toBe('13986197000121')
    })

    it('extrai 1 item', () => {
      expect(nfe.items).toHaveLength(1)
      expect(nfe.items[0].description).toBe('CABO USB-C 2M PREMIUM')
      expect(nfe.items[0].quantity).toBe(50)
    })
  })

  describe('parse — erros', () => {
    it('lança erro para XML inválido', () => {
      expect(() => parser.parse('<root/>')).toThrow('INVALID_XML')
    })

    it('lança erro para string vazia', () => {
      expect(() => parser.parse('')).toThrow()
    })
  })
})
