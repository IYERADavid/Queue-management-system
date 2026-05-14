import { test, expect } from '@playwright/test'

/**
 * Runs serially: the in-memory demo API is shared across tests in one server process.
 */
test.describe.configure({ mode: 'serial' })

async function login(page: import('@playwright/test').Page, email: string, password: string, expectUrl: RegExp) {
  await page.goto('/login')
  await page.getByPlaceholder('your@email.com').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(expectUrl, { timeout: 25_000 })
}

test('TC-AUTH-01 admin login redirects to admin with sidebar', async ({ page }) => {
  await login(page, 'admin@institution.com', 'admin123', /\/admin/)
  await expect(page.getByText('QMS Admin')).toBeVisible()
})

test('TC-AUTH-02 operator login redirects to operator dashboard', async ({ page }) => {
  await login(page, 'john@institution.com', 'operator123', /\/operator\/dashboard/)
  await expect(page.getByRole('heading', { name: /counter/i })).toBeVisible()
})

test('TC-AUTH-03 wrong password shows error and stays on login', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('your@email.com').fill('admin@institution.com')
  await page.locator('input[type="password"]').fill('not-the-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('TC-BOOK-01 kiosk flow shows ticket number', async ({ page }) => {
  await page.goto('/booking/kiosk')
  await page.getByRole('button', { name: /Main Branch/i }).click()
  await page.getByRole('button', { name: /General Consultation/i }).click()
  await page.getByPlaceholder(/full name/i).fill('E2E Kiosk Customer')
  await page.getByRole('button', { name: /Get Ticket/i }).click()
  const ticket = page.getByTestId('kiosk-ticket-number')
  await expect(ticket).toBeVisible({ timeout: 20_000 })
  await expect(ticket).toHaveText(/[A-Z]\d{3}/)
})

test('TC-OP-01 operator calls next and completes; status returns to idle', async ({ page }) => {
  await login(page, 'john@institution.com', 'operator123', /\/operator\/dashboard/)
  const callBtn = page.getByRole('button', { name: /call next/i })
  await expect(callBtn).toBeEnabled({ timeout: 30_000 })
  await callBtn.click()
  await expect(page.getByRole('heading', { name: /^serving$/i })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: /^complete$/i }).click()
  await expect(page.getByText(/^idle$/).first()).toBeVisible({ timeout: 15_000 })
})

test('TC-DISP-01 queue display shows last updated without hard error', async ({ page }) => {
  await page.goto('/display/queue')
  await expect(page.getByText(/last updated/i)).toBeVisible({ timeout: 10_000 })
})

test('TC-ADM-01 admin can add a branch', async ({ page }) => {
  await login(page, 'admin@institution.com', 'admin123', /\/admin/)
  await page.goto('/admin/branches')
  await page.getByRole('button', { name: /New Branch/i }).click()
  const name = `E2E Branch ${Date.now()}`
  await page.getByLabel(/^branch name$/i).fill(name)
  await page.getByLabel(/^location$/i).fill('Downtown')
  await page.getByLabel(/^address$/i).fill('100 Test Lane')
  await page.getByLabel(/^phone number$/i).fill('+1-555-0199')
  await page.getByRole('button', { name: /Create Branch/i }).click()
  await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 })
})

test('TC-MOB-01 mobile book wizard shows confirmation with ticket reference', async ({ page }) => {
  await page.goto('/mobile/book')
  await page.getByRole('button', { name: /^book$/i }).click()
  await page.getByRole('button', { name: /Main Branch/i }).first().click()
  await page.getByRole('button', { name: /General Consultation/i }).first().click()
  await page.getByLabel(/^full name/i).fill('E2E Mobile User')
  await page.getByLabel(/^email/i).fill('e2e-mobile@test.com')
  await page.getByRole('button', { name: /get ticket/i }).click()
  const box = page.getByTestId('mobile-ticket-confirmation')
  await expect(box).toBeVisible({ timeout: 20_000 })
  await expect(box).toContainText(/[A-Z]\d{3}/)
})
