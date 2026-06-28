import { test, expect } from '@playwright/test'

const testPassword = 'secret123'

test.describe('Register', () => {
  test('creates account and redirects to documents', async ({ page }) => {
    const testEmail = `register-${Date.now()}@example.com`

    await page.goto('/register')

    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByTestId('register-submit').click()

    await expect(page).toHaveURL('/documents')
    await expect(page.getByTestId('user-email')).toHaveText(testEmail)
  })
})

test.describe('Login', () => {
  test('logs in with existing account', async ({ page }) => {
    const testEmail = `login-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByTestId('register-submit').click()
    await expect(page).toHaveURL('/documents')

    // Abrir menu de usuário e fazer logout
    await page.getByTestId('user-menu-btn').click()
    await page.getByTestId('logout-btn').click()
    await expect(page).toHaveURL('/login')

    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Senha').fill(testPassword)
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL('/documents')
    await expect(page.getByTestId('user-email')).toHaveText(testEmail)
  })
})

test.describe('Auth guard', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/documents')
    await expect(page).toHaveURL(/\/login/)
  })
})
