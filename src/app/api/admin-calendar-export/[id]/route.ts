import config from '@payload-config'
import { getPayload } from 'payload'

import { calendarToken } from '@/lib/calendar-export'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params
  const unitID = Number(id)
  if (!Number.isSafeInteger(unitID) || unitID <= 0) return new Response('Not found', { status: 404 })
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers }).catch(() => null)
  if (!auth?.user) return new Response('Unauthorized', { status: 401 })
  const secret = process.env.ICAL_EXPORT_SECRET
  if (!secret || secret.length < 32) return Response.json({ error: 'ICAL_EXPORT_SECRET is not configured.' }, { status: 503 })
  const unit = await payload.findByID({ collection: 'accommodations', id: unitID, depth: 0, user: auth.user, overrideAccess: false }).catch(() => null)
  if (!unit) return new Response('Not found', { status: 404 })
  const url = new URL(`/api/calendar-export/${unitID}/${calendarToken(unitID, secret)}`, request.url).toString()
  return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
}
