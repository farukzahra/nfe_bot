import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../../nfe_examples')

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByTestId('register-password').locator('input').fill('secret123')
  await page.getByTestId('register-confirm-password').locator('input').fill('secret123')
  await page.getByTestId('register-submit').click()
  await page.waitForURL('/documents')
}

test.describe('Tela de Importação', () => {
  test('exibe drop zone e botão de importar desabilitado', async ({ page }) => {
    await loginAs(page, `import_ui_${Date.now()}@test.com`)
    await page.goto('/import')

    await expect(page.getByTestId('drop-zone')).toBeVisible()
    await expect(page.getByTestId('upload-btn')).toBeDisabled()
  })

  test('habilita botão ao selecionar arquivo', async ({ page }) => {
    await loginAs(page, `import_sel_${Date.now()}@test.com`)
    await page.goto('/import')

    const fileInput = page.getByTestId('file-input').locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(fixturesDir, '1.xml'))

    await expect(page.getByTestId('upload-btn')).toBeEnabled()
  })

  test('importa 1.xml com sucesso e exibe resultado', async ({ page }) => {
    await loginAs(page, `import_ok_${Date.now()}@test.com`)
    await page.goto('/import')

    const fileInput = page.getByTestId('file-input').locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(fixturesDir, '1.xml'))
    await page.getByTestId('upload-btn').click()

    await expect(page.getByTestId('success-count')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('result-table')).toBeVisible()
  })

  test('importa 2.xml (entrada) com sucesso', async ({ page }) => {
    await loginAs(page, `import_ent_${Date.now()}@test.com`)
    await page.goto('/import')

    const fileInput = page.getByTestId('file-input').locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(fixturesDir, '2.xml'))
    await page.getByTestId('upload-btn').click()

    await expect(page.getByTestId('success-count')).toBeVisible({ timeout: 15000 })
  })

  test('rejeita arquivo PDF com extensão inválida no upload', async ({ page }) => {
    await loginAs(page, `import_pdf_${Date.now()}@test.com`)
    await page.goto('/import')

    const fileInput = page.getByTestId('file-input').locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(fixturesDir, '1.pdf'))
    await page.getByTestId('upload-btn').click()

    // Validação client-side exibe alerta de erro imediatamente
    await expect(page.getByTestId('import-error')).toBeVisible({ timeout: 5000 })
  })
})
