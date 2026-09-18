import config from '@payload-config'
import { getPayload } from 'payload'

import { type ContentLocale, type TranslationEntity } from '@/lib/translation-fields'
import { translateFields } from '@/lib/translation'
import { buildReviewCandidates, reviewFields, sourceIsComplete, translationUnits } from '@/lib/translation-review'

export const runtime = 'nodejs'

type TranslationRequest = { entity?: unknown; id?: unknown; targetLocale?: unknown }

function validEntity(value: unknown): value is TranslationEntity {
  return value === 'accommodations' || value === 'instagram-posts' || value === 'media' || value === 'site-settings' || value === 'pages'
}

function validInput(input: TranslationRequest): input is { entity: TranslationEntity; id?: number; targetLocale: ContentLocale } {
  return validEntity(input.entity) && (input.targetLocale === 'de' || input.targetLocale === 'en') &&
    (input.entity === 'site-settings' || (typeof input.id === 'number' && Number.isSafeInteger(input.id) && input.id > 0))
}

async function sourceDocument(payload: Awaited<ReturnType<typeof getPayload>>, user: NonNullable<Awaited<ReturnType<typeof payload.auth>>['user']>, entity: TranslationEntity, id: number | undefined, locale: ContentLocale) {
  if (entity === 'site-settings') return payload.findGlobal({ slug: 'site-settings', locale, fallbackLocale: false, user, overrideAccess: false, depth: 0 })
  return payload.findByID({ collection: entity, id: id as number, locale, fallbackLocale: false, user, overrideAccess: false, depth: 0, draft: entity === 'pages' || entity === 'accommodations' })
}

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  if (!auth.user) return Response.json({ error: 'Authentication required' }, { status: 401 })
  const url = new URL(request.url)
  const input: TranslationRequest = { entity: url.searchParams.get('entity'), id: Number(url.searchParams.get('id')), targetLocale: url.searchParams.get('targetLocale') }
  if (!validInput(input)) return Response.json({ available: false })
  try {
    const sourceLocale = input.targetLocale === 'de' ? 'en' : 'de'
    const source = await sourceDocument(payload, auth.user, input.entity, input.id, sourceLocale)
    const data = source as unknown as Record<string, unknown>
    return Response.json({ available: sourceIsComplete(input.entity, data) && reviewFields(input.entity, data).length > 0 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ available: false }) }
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  if (!auth.user) return Response.json({ error: 'Authentication required' }, { status: 401 })
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Expected JSON' }, { status: 415 })
  const raw = await request.text()
  if (raw.length > 2_000) return Response.json({ error: 'Request too large' }, { status: 413 })
  let input: TranslationRequest
  try { input = JSON.parse(raw) as TranslationRequest } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!input || typeof input !== 'object' || Array.isArray(input) || !validInput(input)) return Response.json({ error: 'Invalid translation request' }, { status: 400 })
  if (!process.env.OPENROUTER_API_KEY) return Response.json({ error: 'OPENROUTER_API_KEY is not configured on the server' }, { status: 503 })

  try {
    const sourceLocale: ContentLocale = input.targetLocale === 'de' ? 'en' : 'de'
    const source = await sourceDocument(payload, auth.user, input.entity, input.id, sourceLocale)
    const data = source as unknown as Record<string, unknown>
    if (!sourceIsComplete(input.entity, data)) return Response.json({ error: 'Fill all required source-language fields first' }, { status: 422 })
    const fields = reviewFields(input.entity, data)
    const units = translationUnits(fields)
    if (units.length === 0 || units.length > 250 || units.reduce((sum, unit) => sum + unit.text.length, 0) > 50_000) return Response.json({ error: 'Source text is too long' }, { status: 413 })
    const translated = []
    for (let index = 0; index < units.length; index += 50) translated.push(...await translateFields(units.slice(index, index + 50), sourceLocale, input.targetLocale))
    const candidates = buildReviewCandidates(fields, translated).map((field) => {
      if (field.kind !== 'slug' || typeof field.candidate !== 'string') return field
      const slug = field.candidate.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return { ...field, candidate: slug || field.source }
    })
    return Response.json({ fields: candidates }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Admin translation failed' })
    return Response.json({ error: 'Translation failed. Please try again.' }, { status: 502 })
  }
}
