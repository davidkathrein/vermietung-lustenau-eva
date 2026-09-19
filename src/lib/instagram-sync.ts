import type { Payload } from 'payload'
import sharp from 'sharp'

const api = 'https://api.brightdata.com/datasets/v3'
const datasetId = 'gd_l1vikfch901nx3by4'
const intervalMs = 6 * 60 * 60 * 1000

type RecordValue = Record<string, unknown>
type ImportedPost = {
  externalId: string
  permalink: string
  caption?: string
  publishedAt?: string
  imageUrl?: string
}
type MediaCandidate = {
  url: string
  width?: number
  height?: number
  sourcePriority: number
  order: number
}
type DownloadedImage = {
  file: { data: Buffer; mimetype: string; name: string; size: number }
  width?: number
  height?: number
}

function object(value: unknown): RecordValue | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : null
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function positiveNumber(value: unknown): number | undefined {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function urlDimensions(url: string): { width?: number; height?: number } {
  const match = /(?:^|[_?&/])(?:p|s)(\d{2,5})x(\d{2,5})(?:[_?&/.]|$)/i.exec(url)
  return match ? { width: Number(match[1]), height: Number(match[2]) } : {}
}

function dimensions(value: RecordValue, url: string): { width?: number; height?: number } {
  const nested = object(value.dimensions) || object(value.dimension)
  const fromUrl = urlDimensions(url)
  return {
    width: positiveNumber(value.width) || positiveNumber(value.original_width) || positiveNumber(nested?.width) || fromUrl.width,
    height: positiveNumber(value.height) || positiveNumber(value.original_height) || positiveNumber(nested?.height) || fromUrl.height,
  }
}

function mediaCandidates(value: unknown, sourcePriority: number, order = { value: 0 }): MediaCandidate[] {
  const directUrl = nonEmpty(value)
  if (directUrl) {
    const size = urlDimensions(directUrl)
    return [{ url: directUrl, ...size, sourcePriority, order: order.value++ }]
  }
  if (Array.isArray(value)) return value.flatMap((item) => mediaCandidates(item, sourcePriority, order))
  const item = object(value)
  if (!item) return []
  const url = nonEmpty(item.url) || nonEmpty(item.src) || nonEmpty(item.display_url)
  const direct = url ? [{ url, ...dimensions(item, url), sourcePriority, order: order.value++ }] : []
  const nested = Object.entries(item).flatMap(([key, child]) =>
    ['url', 'src', 'display_url', 'width', 'height', 'original_width', 'original_height', 'dimensions', 'dimension'].includes(key)
      ? []
      : mediaCandidates(child, sourcePriority, order),
  )
  return [...direct, ...nested]
}

function largestMediaCandidate(post: RecordValue): MediaCandidate | undefined {
  const order = { value: 0 }
  const candidates = [
    ...mediaCandidates(post.image_url, 4, order),
    ...mediaCandidates(post.images, 3, order),
    ...mediaCandidates(post.photos, 2, order),
    ...mediaCandidates(post.thumbnail, 1, order),
  ]
  return candidates.reduce<MediaCandidate | undefined>((best, candidate) => {
    if (!best) return candidate
    const candidateArea = candidate.width && candidate.height ? candidate.width * candidate.height : undefined
    const bestArea = best.width && best.height ? best.width * best.height : undefined
    if (candidateArea && bestArea && candidateArea !== bestArea) return candidateArea > bestArea ? candidate : best
    if (candidateArea && !bestArea && candidate.sourcePriority >= best.sourcePriority) return candidate
    if (!candidateArea && bestArea && candidate.sourcePriority <= best.sourcePriority) return best
    if (candidate.sourcePriority !== best.sourcePriority) return candidate.sourcePriority > best.sourcePriority ? candidate : best
    return candidate.order < best.order ? candidate : best
  }, undefined)
}

export function instagramProfileUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.username || url.password) return null
    const match = /^\/([a-zA-Z0-9._]{1,30})\/?$/.exec(url.pathname)
    return match ? `https://www.instagram.com/${match[1]}/` : null
  } catch { return null }
}

export function instagramPostUrl(value: unknown): string | null {
  const raw = nonEmpty(value)
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null
    const match = /^\/(p|reel)\/([a-zA-Z0-9_-]+)\/?$/.exec(url.pathname)
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : null
  } catch { return null }
}

export function parseInstagramPosts(value: unknown): ImportedPost[] {
  const records = Array.isArray(value) ? value : [value]
  const posts = records.flatMap((entry) => {
    const record = object(entry)
    return Array.isArray(record?.posts) ? record.posts : record ? [record] : []
  })
  const seen = new Set<string>()
  return posts.flatMap((entry) => {
    const post = object(entry)
    const permalink = instagramPostUrl(post?.url)
    const externalId = nonEmpty(post?.post_id) || nonEmpty(post?.id) || (typeof post?.post_id === 'number' ? String(post.post_id) : undefined)
    if (!post || !permalink || !externalId || seen.has(externalId)) return []
    seen.add(externalId)
    const date = nonEmpty(post.datetime) || nonEmpty(post.date_posted)
    const parsedDate = date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined
    const image = largestMediaCandidate(post)
    return [{
      externalId,
      permalink,
      caption: nonEmpty(post.caption) || nonEmpty(post.description),
      publishedAt: parsedDate,
      imageUrl: image?.url,
    }]
  })
}

async function brightRequest(path: string, key: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    cache: 'no-store',
    signal: AbortSignal.timeout(25_000),
  })
  if (!response.ok) {
    let detail: string | undefined
    const responseBody = await response.text()
    try {
      const error = object(JSON.parse(responseBody))
      detail = nonEmpty(error?.error) || nonEmpty(error?.message)
    } catch {
      const plainText = nonEmpty(responseBody)
      if (plainText && plainText.length <= 240 && !/[<>]/.test(plainText)) detail = plainText
    }
    const safeDetail = detail?.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 240)
    throw new Error(`Bright Data returned HTTP ${response.status}${safeDetail ? `: ${safeDetail}` : ''}`)
  }
  return response.json() as Promise<unknown>
}

function cdnImageUrl(raw: string | undefined): URL | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    if (!['cdninstagram.com', 'fbcdn.net'].some((domain) => url.hostname.endsWith(`.${domain}`))) return null
    return url
  } catch { return null }
}

async function downloadImage(post: ImportedPost): Promise<DownloadedImage | undefined> {
  const url = cdnImageUrl(post.imageUrl)
  if (!url) return undefined
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10_000), cache: 'no-store' })
  const mimetype = response.headers.get('content-type')?.split(';')[0]
  const size = Number(response.headers.get('content-length'))
  if (!response.ok || !mimetype || !['image/jpeg', 'image/png', 'image/webp'].includes(mimetype) || (size > 8_000_000)) return undefined
  const chunks: Uint8Array[] = []
  let total = 0
  const reader = response.body?.getReader()
  if (!reader) return undefined
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > 8_000_000) { await reader.cancel(); return undefined }
    chunks.push(value)
  }
  if (!total) return undefined
  const extension = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg'
  const data = Buffer.concat(chunks)
  const metadata = await sharp(data).metadata()
  return {
    file: { data, mimetype, name: `instagram-${post.externalId}.${extension}`, size: total },
    width: metadata.width,
    height: metadata.height,
  }
}

async function importImage(payload: Payload, post: ImportedPost): Promise<number | undefined> {
  const downloaded = await downloadImage(post)
  if (!downloaded) return undefined
  const media = await payload.create({
    collection: 'media', locale: 'de',
    data: { alt: '', decorative: true },
    file: downloaded.file,
  })
  await payload.update({ collection: 'media', id: media.id, locale: 'en', data: { alt: '' } })
  return media.id
}

function importedInstagramFilenames(externalId: string): string[] {
  return ['jpg', 'png', 'webp'].map((extension) => `instagram-${externalId}.${extension}`)
}

function isImportedInstagramImage(filename: unknown, externalId: string): boolean {
  return importedInstagramFilenames(externalId).includes(String(filename))
}

async function findImportedImage(payload: Payload, post: ImportedPost): Promise<number | undefined> {
  if (!post.imageUrl) return undefined
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    locale: 'de',
    where: {
      or: importedInstagramFilenames(post.externalId).map((filename) => ({ filename: { equals: filename } })),
    },
  })
  return typeof result.docs[0]?.id === 'number' ? result.docs[0].id : undefined
}

async function upgradeImportedImage(payload: Payload, post: ImportedPost, imageId: number): Promise<boolean> {
  if (!post.imageUrl) return false
  const media = await payload.findByID({ collection: 'media', id: imageId, depth: 0, locale: 'de' })
  if (!isImportedInstagramImage(media.filename, post.externalId)) return false
  const downloaded = await downloadImage(post)
  if (!downloaded?.width || !downloaded.height) return false
  const currentWidth = positiveNumber(media.width)
  const currentHeight = positiveNumber(media.height)
  const currentArea = currentWidth && currentHeight ? currentWidth * currentHeight : 0
  if (downloaded.width * downloaded.height <= currentArea) return false
  await payload.update({
    collection: 'media',
    id: imageId,
    locale: 'de',
    data: {},
    file: downloaded.file,
  })
  return true
}

async function importPosts(payload: Payload, raw: unknown, profileUrl: string): Promise<number> {
  const posts = parseInstagramPosts(raw)
  if (!posts.length) throw new Error('Bright Data returned no valid Instagram posts')
  const importOne = async (post: ImportedPost): Promise<number> => {
    const existing = (await payload.find({ collection: 'instagram-posts', where: { externalId: { equals: post.externalId } }, limit: 1, depth: 0, locale: 'de' })).docs[0]
    let image = typeof existing?.image === 'number' ? existing.image : undefined
    const hadAttachedImage = Boolean(image)
    if (!image) {
      try { image = await findImportedImage(payload, post) }
      catch (error) { payload.logger.warn({ err: error, msg: `Could not find existing Instagram image ${post.externalId}` }) }
    }
    if (image && hadAttachedImage) {
      try { await upgradeImportedImage(payload, post, image) }
      catch (error) { payload.logger.warn({ err: error, msg: `Could not upgrade Instagram image ${post.externalId}` }) }
    } else if (!image) {
      try { image = await importImage(payload, post) }
      catch (error) { payload.logger.warn({ err: error, msg: `Could not import Instagram image ${post.externalId}` }) }
    }
    if (existing) {
      if ((!existing.image && image) || !existing.sourceProfile) await payload.update({ collection: 'instagram-posts', id: existing.id, data: { ...(!existing.image && image ? { image } : {}), ...(!existing.sourceProfile ? { sourceProfile: profileUrl } : {}) } })
      return 0
    }
    await payload.create({ collection: 'instagram-posts', locale: 'de', data: {
      externalId: post.externalId, sourceProfile: profileUrl, permalink: post.permalink, caption: post.caption,
      publishedAt: post.publishedAt, image, visible: true,
    } })
    return 1
  }
  let imported = 0
  for (let index = 0; index < Math.min(posts.length, 12); index += 4) {
    const results = await Promise.all(posts.slice(index, index + 4).map(importOne))
    imported += results.reduce((sum, count) => sum + count, 0)
  }
  return imported
}

export async function syncInstagram(payload: Payload, manual = false): Promise<Record<string, unknown>> {
  const key = process.env.BRIGHTDATA_API_KEY
  const profileUrl = instagramProfileUrl(process.env.INSTAGRAM_PROFILE_URL)
  if (!key || !profileUrl) throw new Error('BRIGHTDATA_API_KEY and a valid INSTAGRAM_PROFILE_URL are required')
  const status = await payload.findGlobal({ slug: 'instagram-sync-status', depth: 0 })
  const now = new Date()
  if (status.snapshotId) {
    if (status.startedAt && now.getTime() - new Date(status.startedAt).getTime() > 48 * 60 * 60 * 1000) {
      await payload.updateGlobal({ slug: 'instagram-sync-status', data: { snapshotId: null, lastError: 'Bright Data snapshot did not finish within 48 hours' } })
      return { state: 'failed' }
    }
    const snapshot = status.snapshotId
    const progress = object(await brightRequest(`/progress/${encodeURIComponent(snapshot)}`, key))
    if (progress?.status === 'starting' || progress?.status === 'running') return { state: 'running', startedAt: status.startedAt }
    if (progress?.status === 'failed' || progress?.status === 'canceled') {
      await payload.updateGlobal({ slug: 'instagram-sync-status', data: { snapshotId: null, lastError: `Bright Data snapshot ${String(progress.status)}` } })
      return { state: 'failed' }
    }
    if (progress?.status !== 'ready') throw new Error('Unknown Bright Data snapshot status')
    const data = await brightRequest(`/snapshot/${encodeURIComponent(snapshot)}?format=json`, key)
    const imported = await importPosts(payload, data, instagramProfileUrl(status.profileUrl ?? undefined) || profileUrl)
    await payload.updateGlobal({ slug: 'instagram-sync-status', data: { snapshotId: null, completedAt: now.toISOString(), lastImportedCount: imported, lastError: null } })
    return { state: 'imported', imported }
  }
  if (!manual && status.startedAt && status.profileUrl === profileUrl && now.getTime() - new Date(status.startedAt).getTime() < intervalMs) return { state: 'waiting', nextRunAt: new Date(new Date(status.startedAt).getTime() + intervalMs).toISOString() }
  const triggered = object(await brightRequest(`/trigger?dataset_id=${datasetId}&include_errors=true`, key, {
    method: 'POST', body: JSON.stringify([{ url: profileUrl }]),
  }))
  const snapshotId = nonEmpty(triggered?.snapshot_id)
  if (!snapshotId) throw new Error('Bright Data did not return a snapshot ID')
  await payload.updateGlobal({ slug: 'instagram-sync-status', data: { snapshotId, profileUrl, startedAt: now.toISOString(), lastError: null } })
  return { state: 'started', startedAt: now.toISOString() }
}

export async function runInstagramSync(payload: Payload, manual = false): Promise<Record<string, unknown>> {
  try { return await syncInstagram(payload, manual) }
  catch (error) {
    try {
      await payload.updateGlobal({ slug: 'instagram-sync-status', data: { lastError: error instanceof Error ? error.message : 'Instagram sync failed' } })
    } catch { /* The original error is more useful if the database is unavailable. */ }
    throw error
  }
}
