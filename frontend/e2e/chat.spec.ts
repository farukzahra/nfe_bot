import { test, expect } from '@playwright/test'

async function registerAndLogin(page: import('@playwright/test').Page) {
  const email = `chat_${Date.now()}@test.com`
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByTestId('register-password').locator('input').fill('secret123')
  await page.getByTestId('register-confirm-password').locator('input').fill('secret123')
  await page.getByTestId('register-submit').click()
  await page.waitForURL('/documents')
  return email
}

test.describe('Tela de Chat', () => {
  test('exibe tela de chat após login', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/chat')

    await expect(page.getByText('Assistente Fiscal')).toBeVisible()
    await expect(page.getByTestId('chat-input')).toBeVisible()
    await expect(page.getByTestId('chat-send')).toBeVisible()
  })

  test('botão enviar desabilitado sem texto', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/chat')

    const sendBtn = page.getByTestId('chat-send')
    await expect(sendBtn).toBeDisabled()
  })

  test('mostra sugestões de perguntas na tela vazia', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/chat')

    await expect(page.getByText('Quanto vendi este mês?')).toBeVisible()
    await expect(page.getByText('Quais são meus 5 maiores clientes?')).toBeVisible()
  })

  test('habilita botão ao digitar', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/chat')

    await page.getByTestId('chat-input').locator('textarea').first().fill('Olá')
    await expect(page.getByTestId('chat-send')).toBeEnabled()
  })
})
