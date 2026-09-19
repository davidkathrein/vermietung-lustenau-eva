import config from '@payload-config'
import { getPayload } from 'payload'

import { authorizedCron } from '@/lib/cron-auth'
import { runInstagramSync } from '@/lib/instagram-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request): Promise<Response> {
  if (!authorizedCron(request)) return new Response('Unauthorized', { status: 401 })
  const payload = await getPayload({ config })
  try { return Response.json(await runInstagramSync(payload), { headers: { 'Cache-Control': 'no-store' } }) }
  catch (error) {
    payload.logger.error({ err: error, msg: 'Scheduled Instagram sync failed' })
    return Response.json({ error: 'Instagram sync failed' }, { status: 502 })
  }
}
