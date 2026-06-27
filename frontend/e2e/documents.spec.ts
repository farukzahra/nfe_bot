import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../../nfe_examples')

async function registerAndLogin(page: import('@playwright/test').Page) {
  const email = `docs_${Date.now()}@test.com`
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByTestId('register-password').locator('input').fill('secret123')
  await page.getByTestId('register-confirm-password').locator('input').fill('secret123')
  await page.getByTestId('register-submit').click()
  await page.waitForURL('/documents')
  return email
}

async function importXml(page: import('@playwright/test').Page, file: string) {
  await page.goto('/import')
  const fileInput = page.getByTestId('file-input').locator('input[type="file"]')
  await fileInput.setInputFiles(path.join(fixturesDir, file))
  await page.getByTestId('upload-btn').click()
  await expect(page.getByTestId('success-count')).toBeVisible({ timeout: 15000 })
}

test.describe('Tela de Documentos', () => {
  test('exibe estado vazio antes de importar', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/documents')
    await expect(page.getByTestId('documents-table')).toBeVisible()
    await expect(page.getByText('Nenhum documento encontrado')).toBeVisible()
  })

  test('lista documento após importar XML', async ({ page }) => {
    await registerAndLogin(page)
    await importXml(page, '1.xml')
    await page.goto('/documents')

    await expect(page.getByTestId('doc-row').first()).toBeVisible({ timeout: 10000 })
  })

  test('abre drawer ao clicar na linha', async ({ page }) => {
    await registerAndLogin(page)
    await importXml(page, '1.xml')
    await page.goto('/documents')

    await page.getByTestId('doc-row').first().click()
    await expect(page.getByTestId('doc-drawer')).toBeVisible()
    await expect(page.getByTestId('btn-view-detail')).toBeVisible()
  })

  test('navega para página de detalhe', async ({ page }) => {
    await registerAndLogin(page)
    await importXml(page, '1.xml')
    await page.goto('/documents')

    await page.getByTestId('doc-row').first().click()
    await expect(page.getByTestId('doc-drawer')).toBeVisible()

    // Aguarda animação do drawer e rola até o botão antes de clicar
    const btn = page.getByTestId('btn-view-detail')
    await btn.waitFor({ state: 'visible' })
    await btn.scrollIntoViewIfNeeded()
    await btn.click()

    await page.waitForURL(/\/documents\/.+/, { timeout: 15000 })
    await expect(page.getByText(/NF-e Nº/)).toBeVisible()
  })

  test('filtro de aba Entradas mostra somente entradas', async ({ page }) => {
    await registerAndLogin(page)
    await importXml(page, '1.xml') // saída
    await importXml(page, '2.xml') // entrada
    await page.goto('/documents')

    await page.getByRole('tab', { name: 'Entradas' }).click()
    await page.waitForTimeout(500)

    const rows = page.getByTestId('doc-row')
    await expect(rows).toHaveCount(1)
  })

  test('exclui documento', async ({ page }) => {
    await registerAndLogin(page)
    await importXml(page, '1.xml')
    await page.goto('/documents')

    await page.getByTestId('doc-row').first().click()
    await page.getByTestId('btn-delete').click()

    await expect(page.getByText('Nenhum documento encontrado')).toBeVisible({ timeout: 10000 })
  })
})
