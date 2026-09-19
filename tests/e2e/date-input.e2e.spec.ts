import { expect, test } from '@playwright/test'

import { addCalendarDays, formatCalendarDay, todayInVienna } from '../../src/lib/calendar-day'

function compactDate(day: string): string {
  return `${day.slice(8, 10)}${day.slice(5, 7)}${day.slice(2, 4)}`
}

test('accepts compact dates and formats them when focus leaves the field', async ({ page }) => {
  const arrival = addCalendarDays(todayInVienna(), 1)
  const departure = addCalendarDays(arrival, 2)

  await page.goto('/de/wohnungen/wohnung-1')

  const arrivalInput = page.getByLabel('Anreise')
  const departureInput = page.getByLabel('Abreise')

  await arrivalInput.fill(compactDate(arrival))
  await departureInput.click()
  await expect(arrivalInput).toHaveValue(formatCalendarDay(arrival, 'de'))

  await departureInput.fill(compactDate(departure))
  await page.getByLabel('Name').click()
  await expect(departureInput).toHaveValue(formatCalendarDay(departure, 'de'))
  await expect(page.getByText(`${formatCalendarDay(arrival, 'de')} – ${formatCalendarDay(departure, 'de')}`)).toBeVisible()
})

test('preserves an invalid value and explains how to fix it', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')

  const arrivalInput = page.getByLabel('Anreise')
  await arrivalInput.fill('3102')
  await page.getByLabel('Abreise').click()

  await expect(arrivalInput).toHaveValue('3102')
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte gib ein gültiges Datum ein.' })).toBeVisible()
  await expect(page.getByText('Bitte einen gültigen Termin wählen.')).toBeVisible()
})

test('keeps a calendar picker beside the free-form field', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')
  await page.getByRole('button', { name: 'Kalender öffnen' }).first().click()
  await expect(page.getByRole('grid')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nächster Monat' })).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte gib ein Datum ein.' })).toHaveCount(0)
})
