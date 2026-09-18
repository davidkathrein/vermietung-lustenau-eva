import config from '@payload-config'
import { getPayload } from 'payload'

import { expandManualBlock, getAvailability } from '@/lib/availability'

export const runtime = 'nodejs'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function validDay(value: string): boolean {
  if (!datePattern.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function viennaToday(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'de'
  const from = url.searchParams.get('from') || viennaToday()
  const through = url.searchParams.get('through') || (() => {
    const date = new Date(`${from}T00:00:00Z`)
    date.setUTCMonth(date.getUTCMonth() + 3)
    return date.toISOString().slice(0, 10)
  })()
  if (!validDay(from) || !validDay(through) || through < from) {
    return Response.json({ error: 'Invalid date range' }, { status: 400 })
  }
  const dayCount = (Date.parse(`${through}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000
  if (dayCount > 366) return Response.json({ error: 'Date range exceeds one year' }, { status: 400 })

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'accommodations',
    where: { published: { equals: true }, _status: { equals: 'published' } },
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 20,
    sort: 'sortOrder',
  })
  const manualDates = new Map<number, Set<string>>()
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await payload.find({
      collection: 'manual-blocks',
      where: {
        and: [
          { startDate: { less_than_equal: `${through}T23:59:59.999Z` } },
          { endDate: { greater_than: `${from}T00:00:00.000Z` } },
          { active: { equals: true } },
        ],
      },
      depth: 0,
      limit: 100,
      page,
    })
    for (const block of result.docs) {
      const unitId = typeof block.accommodation === 'number' ? block.accommodation : block.accommodation.id
      const dates = manualDates.get(unitId) ?? new Set<string>()
      expandManualBlock(block.startDate, block.endDate, from, through).forEach((date) => dates.add(date))
      if (block.usage === 'seminar') {
        const previous = new Date(`${block.startDate.slice(0, 10)}T12:00:00Z`)
        previous.setUTCDate(previous.getUTCDate() - 1)
        const day = previous.toISOString().slice(0, 10)
        if (day >= from && day <= through) dates.add(day)
      }
      manualDates.set(unitId, dates)
    }
    hasNextPage = result.hasNextPage
    page += 1
  }
  const statuses = await Promise.all(docs.map((unit) => getAvailability(unit, from, through, [...(manualDates.get(unit.id) ?? [])].sort())))
  return Response.json({
    from,
    through,
    units: docs.map((unit, index) => ({
      id: unit.id,
      slug: unit.slug,
      name: unit.name,
      sleeps: unit.sleeps,
      seminarCapable: unit.seminarCapable === true,
      ...statuses[index],
    })),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
