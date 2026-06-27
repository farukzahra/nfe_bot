import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: 'list',
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/nfe',
        JWT_SECRET: 'test-secret-key-min-8-chars',
        JWT_EXPIRES_IN: '7d',
        NODE_ENV: 'development',
        PORT: '3000',
      },
    },
    {
      command: 'npm run dev',
      cwd: '.',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
