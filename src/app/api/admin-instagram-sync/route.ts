import config from '@payload-config'
import { getPayload } from 'payload'

import { instagramProfileUrl, runInstagramSync } from '@/lib/instagram-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

async function authenticated(request: Request) {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  return { payload, authorized: Boolean(auth.user) }
}

export async function GET(request: Request): Promise<Response> {
  const { payload, authorized } = await authenticated(request)
  if (!authorized) return Response.json({ error: 'Authentication required' }, { status: 401 })
  const status = await payload.findGlobal({ slug: 'instagram-sync-status', depth: 0 })
  return Response.json({ configured: Boolean(process.env.BRIGHTDATA_API_KEY && instagramProfileUrl(process.env.INSTAGRAM_PROFILE_URL)), status }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request): Promise<Response> {
  const { payload, authorized } = await authenticated(request)
  if (!authorized) return Response.json({ error: 'Authentication required' }, { status: 401 })
  try { return Response.json(await runInstagramSync(payload, true), { headers: { 'Cache-Control': 'no-store' } }) }
  catch (error) {
    payload.logger.error({ err: error, msg: 'Manual Instagram sync failed' })
    return Response.json({ error: error instanceof Error ? error.message : 'Instagram sync failed' }, { status: 502 })
  }
}
