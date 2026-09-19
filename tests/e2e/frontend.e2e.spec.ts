import { expect, test } from '@playwright/test'

async function expectClearInteractiveAffordances(page: import('@playwright/test').Page) {
  const cursorFailures = await page.locator('a[href], button:not(:disabled), [role="button"]:not([aria-disabled="true"])').evaluateAll((elements) => elements.flatMap((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    return getComputedStyle(element).cursor === 'pointer' ? [] : [element.outerHTML]
  }))
  expect(cursorFailures).toEqual([])

  const unclearLinks = await page.locator('a[href]:not([data-slot="button"])').evaluateAll((elements) => elements.flatMap((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    const candidates = [element, ...element.querySelectorAll('*')]
    return candidates.some((candidate) => getComputedStyle(candidate).textDecorationLine.includes('underline')) ? [] : [element.outerHTML]
  }))
  expect(unclearLinks).toEqual([])

  const textLinks = page.locator('a[href]:not([data-slot="button"])')
  const doubleLineLinks: string[] = []
  for (let index = 0; index < await textLinks.count(); index += 1) {
    const link = textLinks.nth(index)
    if (!await link.isVisible()) continue
    await link.hover()
    const doubleLine = await link.evaluate((element) => {
      const style = getComputedStyle(element)
      const candidates = [element, ...element.querySelectorAll('*')]
      const hasUnderline = candidates.some((candidate) => getComputedStyle(candidate).textDecorationLine.includes('underline'))
      const hasVisibleBottomBorder = Number.parseFloat(style.borderBottomWidth) > 0
        && style.borderBottomStyle !== 'none'
        && style.borderBottomColor !== 'transparent'
        && style.borderBottomColor !== 'rgba(0, 0, 0, 0)'
      return hasUnderline && hasVisibleBottomBorder
    })
    if (doubleLine) doubleLineLinks.push(await link.evaluate((element) => element.outerHTML))
  }
  expect(doubleLineLinks).toEqual([])
}

test('serves the bilingual homepage and redirects the language-less root permanently', async ({ page, request }) => {
  const root = await request.get('/', { maxRedirects: 0 })
  expect(root.status()).toBe(308)
  expect(root.headers().location).toBe('/de')
  await page.goto('/de')
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByRole('heading', { name: 'Ankommen. Durchatmen. Bleiben.' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Heller Wohnbereich mit Holztisch und Sofa' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Wohnung 1 / Seminarraum' })).toBeVisible()
  const germanLanguages = page.getByRole('navigation', { name: 'Sprache wählen' })
  await expect(germanLanguages).toHaveText('DE/EN')
  await expect(germanLanguages.locator('[aria-current="page"]')).toHaveText('DE')
  await expect(page.getByRole('link', { name: 'Buchung anfragen' })).toHaveAttribute('href', '/de/kontakt#anfrage')
  await page.goto('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'Arrive. Unwind. Stay.' })).toBeVisible()
  const englishLanguages = page.getByRole('navigation', { name: 'Choose language' })
  await expect(englishLanguages).toHaveText('DE/EN')
  await expect(englishLanguages.locator('[aria-current="page"]')).toHaveText('EN')
  await page.getByRole('link', { name: 'Request booking' }).click()
  await expect(page).toHaveURL(/\/en\/contact#anfrage$/)
  await expect(page.locator('#anfrage')).toBeVisible()
})

test('shows the header again when scrolling up', async ({ page }) => {
  await page.goto('/de')

  const header = page.locator('.site-header')
  await expect(header).toHaveAttribute('data-scroll-aware', 'true')
  await expect(header).toHaveAttribute('data-visible', 'true')

  await page.evaluate(() => window.scrollTo(0, 1200))
  await expect(header).toHaveAttribute('data-visible', 'false')

  await page.evaluate(() => window.scrollTo(0, 600))
  await expect(header).toHaveAttribute('data-visible', 'true')
})

test('keeps the current page and scroll area when switching languages', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-3')
  await page.evaluate(() => window.scrollTo(0, 700))

  const progressBefore = await page.evaluate(() => window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))
  const languageLink = page.getByRole('link', { name: 'Switch to English' })
  const languageLinkBox = await languageLink.boundingBox()
  if (!languageLinkBox) throw new Error('Language switch link is not visible')
  await page.mouse.click(languageLinkBox.x + languageLinkBox.width / 2, languageLinkBox.y + languageLinkBox.height / 2)

  await expect(page).toHaveURL(/\/en\/apartments\/apartment-3$/)
  await expect(page.getByRole('heading', { name: 'Apartment 3' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  const progressAfter = await page.evaluate(() => window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))
  expect(Math.abs(progressAfter - progressBefore)).toBeLessThan(0.08)
})

test('shows the shared seminar usage and does not claim availability without feeds', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')
  await expect(page.getByRole('heading', { name: 'Wohnung 1 / Seminarraum' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Heller Raum mit langem Tisch für Seminare' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Seminar' })).toBeVisible()
  await expect(page.getByText('Bitte einen Termin wählen.')).toBeVisible()
})

test('opens an apartment image in a lightbox and closes it with Escape', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')
  await page.getByRole('button', { name: 'Bild 1 in voller Größe öffnen' }).click()
  const lightbox = page.getByRole('dialog', { name: 'Bilder von Wohnung 1 / Seminarraum' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox.getByRole('img', { name: 'Heller Raum mit langem Tisch für Seminare' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(lightbox).not.toBeVisible()
})

test('shows the inquiry form immediately on the contact page', async ({ page }) => {
  await page.goto('/de/kontakt')

  await expect(page.locator('.site-hero-section')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Ihre Anfrage' })).toBeVisible()
  await expect(page.locator('.site-inquiry-form')).toBeInViewport()
})

test('keeps links and buttons visually recognizable across public pages', async ({ page }) => {
  for (const path of ['/de', '/de/wohnungen/wohnung-1', '/de/kontakt']) {
    await page.goto(path)
    await expectClearInteractiveAffordances(page)
  }
})
