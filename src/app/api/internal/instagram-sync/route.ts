import { timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { runInstagramSync } from '@/lib/instagram-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.INSTAGRAM_SYNC_TOKEN
  const actual = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!expected || expected.length < 32 || !actual || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
    return new Response('Unauthorized', { status: 401 })
  }
  const payload = await getPayload({ config })
  try { return Response.json(await runInstagramSync(payload), { headers: { 'Cache-Control': 'no-store' } }) }
  catch (error) {
    payload.logger.error({ err: error, msg: 'Scheduled Instagram sync failed' })
    return Response.json({ error: 'Instagram sync failed' }, { status: 502 })
  }
}
