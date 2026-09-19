import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

import { generateAltText } from '@/lib/alt-text'
import type { ContentLocale } from '@/lib/translation-fields'

export const runtime = 'nodejs'

type AltTextRequest = { id?: unknown; targetLocale?: unknown }

function validInput(input: AltTextRequest): input is { id: number; targetLocale: ContentLocale } {
  return typeof input.id === 'number' && Number.isSafeInteger(input.id) && input.id > 0 &&
    (input.targetLocale === 'de' || input.targetLocale === 'en')
}

async function localImageDataURL(imageURL: string, requestURL: string, resize: boolean): Promise<string> {
  const response = await fetch(new URL(imageURL, requestURL), { cache: 'no-store', signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error('Could not load media image')
  const declaredSize = Number(response.headers.get('content-length') || 0)
  if (declaredSize > 20_000_000) throw new Error('Media image is too large')
  const source = Buffer.from(await response.arrayBuffer())
  if (source.byteLength > 20_000_000) throw new Error('Media image is too large')
  const image = resize
    ? await sharp(source).rotate().resize({ width: 768, height: 768, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
    : source
  const mimeType = resize ? 'image/webp' : (response.headers.get('content-type')?.split(';')[0] || 'image/webp')
  return `data:${mimeType};base64,${image.toString('base64')}`
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  if (!auth.user) return Response.json({ error: 'Authentication required' }, { status: 401 })
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Expected JSON' }, { status: 415 })
  const raw = await request.text()
  if (raw.length > 1_000) return Response.json({ error: 'Request too large' }, { status: 413 })
  let input: AltTextRequest
  try { input = JSON.parse(raw) as AltTextRequest } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!input || typeof input !== 'object' || Array.isArray(input) || !validInput(input)) return Response.json({ error: 'Invalid alt text request' }, { status: 400 })
  if (!process.env.OPENROUTER_API_KEY) return Response.json({ error: 'OPENROUTER_API_KEY is not configured on the server' }, { status: 503 })

  try {
    const media = await payload.findByID({
      collection: 'media', id: input.id, locale: input.targetLocale, fallbackLocale: false,
      user: auth.user, overrideAccess: false, depth: 0,
    })
    if (!media.mimeType?.startsWith('image/')) return Response.json({ error: 'Alt text can only be generated for images' }, { status: 422 })
    const generatedURL = media.sizes?.ai?.url
    const sourceURL = generatedURL || media.url
    if (!sourceURL) return Response.json({ error: 'No image is available for analysis' }, { status: 422 })
    const imageURL = generatedURL && /^https?:\/\//i.test(generatedURL)
      ? generatedURL
      : await localImageDataURL(sourceURL, request.url, !generatedURL)
    const alt = await generateAltText(imageURL, input.targetLocale, { caption: media.caption, filename: media.filename })
    return Response.json({ alt }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Admin alt text generation failed' })
    return Response.json({ error: 'Alt text generation failed. Please try again.' }, { status: 502 })
  }
}
