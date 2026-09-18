import config from '@payload-config'
import { getPayload } from 'payload'

import { calendarFeed, validCalendarToken } from '@/lib/calendar-export'

export const runtime = 'nodejs'

export async function GET(_request: Request, context: { params: Promise<{ id: string; token: string }> }): Promise<Response> {
  const { id, token } = await context.params
  const unitID = Number(id)
  const secret = process.env.ICAL_EXPORT_SECRET
  if (!secret || secret.length < 32) return new Response('Calendar export is not configured', { status: 503 })
  if (!Number.isSafeInteger(unitID) || unitID <= 0 || !validCalendarToken(unitID, secret, token)) return new Response('Not found', { status: 404 })

  const payload = await getPayload({ config })
  const unit = await payload.findByID({ collection: 'accommodations', id: unitID, depth: 0 }).catch(() => null)
  if (!unit) return new Response('Not found', { status: 404 })
  const allBlocks = []
  let page = 1
  while (true) {
    const result = await payload.find({ collection: 'manual-blocks', where: { accommodation: { equals: unitID }, active: { equals: true } }, depth: 0, limit: 500, page, sort: 'startDate' })
    allBlocks.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }
  return new Response(calendarFeed(unitID, allBlocks), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store, max-age=0' } })
}
