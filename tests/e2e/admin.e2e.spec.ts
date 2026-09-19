import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto(`${baseURL}/admin`)
    await expect(page).toHaveURL(`${baseURL}/admin`)
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto(`${baseURL}/admin/collections/users`)
    await expect(page).toHaveURL(new RegExp(`${baseURL}/admin/collections/users(?:\\?.*)?$`))
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('shows the manual Instagram sync control', async () => {
    await page.goto(`${baseURL}/admin/collections/instagram-posts`)
    await expect(page.getByRole('button', { name: /Instagram jetzt abrufen|Collect Instagram now|Abruf jetzt prüfen|Check collection now/ })).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto(`${baseURL}/admin/collections/users/create`)
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
