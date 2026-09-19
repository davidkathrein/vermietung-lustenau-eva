import { expect, test } from '@playwright/test'

import { addCalendarDays, formatCalendarDay, todayInVienna } from '../../src/lib/calendar-day'

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
  const headerSurface = await header.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      backdropFilter: style.backdropFilter,
      backgroundColor: style.backgroundColor,
    }
  })
  expect(headerSurface.backdropFilter).toContain('blur(14px)')
  expect(headerSurface.backgroundColor).toMatch(/\/ 0\.78\)$/)

  await page.evaluate(() => window.scrollTo(0, 1200))
  await expect(header).toHaveAttribute('data-visible', 'false')

  await page.evaluate(() => window.scrollTo(0, 600))
  await expect(header).toHaveAttribute('data-visible', 'true')
})

test('uses an accessible burger menu on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/de')

  const menuButton = page.getByRole('button', { name: 'Menü öffnen' })
  await expect(menuButton).toBeVisible()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).not.toBeVisible()

  await menuButton.click()
  await expect(page.getByRole('button', { name: 'Menü schließen' })).toHaveAttribute('aria-expanded', 'true')
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Hauptnavigation' })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'Wohnungen' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Buchung anfragen' })).toBeVisible()

  await mobileNavigation.getByRole('link', { name: 'Wohnungen' }).click()
  await expect(page).toHaveURL(/\/de\/wohnungen$/)
  await expect(page.getByRole('button', { name: 'Menü öffnen' })).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
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
  await expect(page.getByRole('tab', { name: 'Seminarraum' })).toBeVisible()
  await expect(page.getByText('Bitte einen gültigen Termin wählen.')).toBeVisible()
})

test('opens an apartment image in a lightbox and closes it with Escape', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')
  const openImageButton = page.getByRole('button', { name: 'Bild 1 in voller Größe öffnen' })

  await expect(openImageButton).toHaveCSS('cursor', 'pointer')
  await expect(openImageButton.locator('.site-room-carousel__open-label')).toHaveCount(0)

  await openImageButton.click()
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
  await expect(page.getByRole('tab', { name: 'Schlafräume' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Seminarraum' })).toBeVisible()
})

test('always offers sleeping rooms and seminar room in apartment inquiry forms', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-2')

  const inquiryForm = page.locator('.site-inquiry-form')
  await expect(inquiryForm.getByRole('tab', { name: 'Schlafräume' })).toBeVisible()
  await expect(inquiryForm.getByRole('tab', { name: 'Seminarraum' })).toBeVisible()
})

test('keeps the sticky availability card below the visible header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.goto('/de/kontakt')

  const header = page.locator('.site-header')
  const form = page.locator('.site-form-card')
  const availability = page.locator('.site-availability-card')
  const formTop = await form.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)

  await page.evaluate((top) => window.scrollTo(0, top + 350), formTop)
  await expect(header).toHaveAttribute('data-visible', 'false')
  await page.evaluate(() => window.scrollBy(0, -60))
  await expect(header).toHaveAttribute('data-visible', 'true')

  const positions = await page.locator('.site-header, .site-availability-card').evaluateAll(([headerElement, availabilityElement]) => ({
    headerBottom: headerElement.getBoundingClientRect().bottom,
    availabilityTop: availabilityElement.getBoundingClientRect().top,
  }))
  expect(positions.availabilityTop).toBeGreaterThanOrEqual(positions.headerBottom + 15)
})

test('marks required inquiry fields and supports stay and seminar ranges', async ({ page }) => {
  await page.goto('/de/kontakt')

  const form = page.locator('.site-form-card form')
  const stayArrival = addCalendarDays(todayInVienna(), 14)
  const stayDeparture = addCalendarDays(stayArrival, 3)
  const seminarStart = addCalendarDays(todayInVienna(), 30)
  const seminarEnd = addCalendarDays(seminarStart, 2)
  await expect(form.getByText('* Pflichtfeld')).toBeVisible()
  await expect(form.locator(':scope > :last-child')).toHaveClass(/site-inquiry-form__footer/)
  await expect(form.locator('.site-inquiry-form__footer').getByText('* Pflichtfeld')).toBeVisible()
  for (const label of ['Wohnung wählen', 'Anreise', 'Abreise', 'Name', 'E-Mail', 'Personen']) {
    await expect(form.locator('label, legend').filter({ hasText: label })).toContainText('*')
  }

  await form.locator('#inquiry-arrival').fill(stayArrival)
  await form.locator('#inquiry-arrival').blur()
  await form.locator('#inquiry-departure').fill(stayDeparture)
  await form.locator('#inquiry-departure').blur()
  await expect(form.getByText('3 Nächtigungen')).toBeVisible()

  await page.getByRole('tab', { name: 'Seminarraum' }).click()
  await expect(form.getByLabel('Seminarbeginn')).toBeVisible()
  await expect(form.getByLabel('Seminarende')).toBeVisible()
  await form.locator('#inquiry-arrival').fill(seminarStart)
  await form.locator('#inquiry-arrival').blur()
  await form.locator('#inquiry-departure').fill(seminarEnd)
  await form.locator('#inquiry-departure').blur()
  await expect(page.getByText(`Geprüfter Zeitraum: ${formatCalendarDay(seminarStart, 'de')} – ${formatCalendarDay(seminarEnd, 'de')}`)).toBeVisible()
})

test('keeps links and buttons visually recognizable across public pages', async ({ page }) => {
  for (const path of ['/de', '/de/wohnungen/wohnung-1', '/de/kontakt']) {
    await page.goto(path)
    await expectClearInteractiveAffordances(page)
  }
})
