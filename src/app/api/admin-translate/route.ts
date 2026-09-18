import config from '@payload-config'
import { getPayload } from 'payload'

import { translationFields, type ContentLocale, type TranslationEntity } from '@/lib/translation-fields'
import { translateFields } from '@/lib/translation'

export const runtime = 'nodejs'

type TranslationRequest = { entity?: unknown; id?: unknown; targetLocale?: unknown }

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'Expected JSON' }, { status: 415 })
  }
  const raw = await request.text()
  if (raw.length > 2_000) return Response.json({ error: 'Request too large' }, { status: 413 })

  let input: TranslationRequest
  try {
    input = JSON.parse(raw) as TranslationRequest
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
    (input.entity !== 'accommodations' && input.entity !== 'media' && input.entity !== 'site-settings') ||
    (input.targetLocale !== 'de' && input.targetLocale !== 'en') ||
    (input.entity !== 'site-settings' && !(typeof input.id === 'number' && Number.isSafeInteger(input.id) && input.id > 0))) {
    return Response.json({ error: 'Invalid translation request' }, { status: 400 })
  }

  const entity = input.entity as TranslationEntity
  const targetLocale = input.targetLocale as ContentLocale
  const sourceLocale: ContentLocale = targetLocale === 'de' ? 'en' : 'de'
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'OPENROUTER_API_KEY is not configured on the server' }, { status: 503 })
  }

  try {
    const source = entity === 'site-settings'
      ? await payload.findGlobal({ slug: 'site-settings', locale: sourceLocale, fallbackLocale: false, user, overrideAccess: false, depth: 0 })
      : await payload.findByID({ collection: entity, id: input.id as number, locale: sourceLocale, fallbackLocale: false, user, overrideAccess: false, depth: 0 })
    const fields = translationFields(entity, source as unknown as Record<string, unknown>)
    if (fields.length === 0) return Response.json({ error: 'Save source-language text first' }, { status: 422 })
    if (fields.length > 50 || fields.reduce((sum, field) => sum + field.text.length, 0) > 20_000) {
      return Response.json({ error: 'Source text is too long' }, { status: 413 })
    }
    const translated = await translateFields(fields, sourceLocale, targetLocale)
    return Response.json({ fields: translated }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    // Never return the provider response or any private source text to the browser on failure.
    payload.logger.error({ err: error, msg: 'Admin translation failed' })
    return Response.json({ error: 'Translation failed. Please try again.' }, { status: 502 })
  }
}
