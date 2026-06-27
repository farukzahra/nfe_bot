import { test, expect } from '@playwright/test'

test.describe('About', () => {
  test('shows documentation index after login', async ({ page }) => {
    const testEmail = `about-${Date.now()}@example.com`
    const testPassword = 'secret123'

    await page.goto('/register')
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByTestId('register-submit').click()
    await expect(page).toHaveURL('/documents')

    await page.getByTestId('nav-about').click()
    await expect(page).toHaveURL('/about')
    await expect(page.getByText('Sobre o NFe Bot')).toBeVisible()
    await expect(page.getByText('Visão Geral')).toBeVisible()
    await expect(page.getByText('docs/visual.md')).toBeVisible()
  })
})
