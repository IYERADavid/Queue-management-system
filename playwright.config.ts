import { defineConfig, devices } from '@playwright/test'

const E2E_PORT = Number(process.env.PLAYWRIGHT_PORT ?? '3000')
const baseURL = `http://127.0.0.1:${E2E_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run build && cd .next/standalone && HOSTNAME=127.0.0.1 PORT=${E2E_PORT} node server.js`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
