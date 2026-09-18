import type { Payload } from 'payload'

const api = 'https://api.brightdata.com/datasets/v3'
const datasetId = 'gd_lk5ns7kz21pck8jpis'
const intervalMs = 6 * 60 * 60 * 1000

type RecordValue = Record<string, unknown>
type ImportedPost = { externalId: string; permalink: string; caption?: string; publishedAt?: string; imageUrl?: string }

function object(value: unknown): RecordValue | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : null
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
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

function postUrl(value: unknown): string | null {
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
    const permalink = postUrl(post?.url)
    const externalId = nonEmpty(post?.id)
    if (!post || !permalink || !externalId || seen.has(externalId)) return []
    seen.add(externalId)
    const date = nonEmpty(post.datetime) || nonEmpty(post.date_posted)
    const parsedDate = date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined
    return [{ externalId, permalink, caption: nonEmpty(post.caption) || nonEmpty(post.description), publishedAt: parsedDate, imageUrl: nonEmpty(post.image_url) }]
  })
}

async function brightRequest(path: string, key: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    cache: 'no-store',
    signal: AbortSignal.timeout(25_000),
  })
  if (!response.ok) throw new Error(`Bright Data returned HTTP ${response.status}`)
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

async function importImage(payload: Payload, post: ImportedPost): Promise<number | undefined> {
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
  const media = await payload.create({
    collection: 'media', locale: 'de',
    data: { alt: `Instagram-Beitrag ${post.externalId}` },
    file: { data: Buffer.concat(chunks), mimetype, name: `instagram-${post.externalId}.${extension}`, size: total },
  })
  await payload.update({ collection: 'media', id: media.id, locale: 'en', data: { alt: `Instagram post ${post.externalId}` } })
  return media.id
}

async function importPosts(payload: Payload, raw: unknown): Promise<number> {
  const posts = parseInstagramPosts(raw)
  if (!posts.length) throw new Error('Bright Data returned no valid Instagram posts')
  const importOne = async (post: ImportedPost): Promise<number> => {
    const existing = (await payload.find({ collection: 'instagram-posts', where: { externalId: { equals: post.externalId } }, limit: 1, depth: 0, locale: 'de' })).docs[0]
    let image = typeof existing?.image === 'number' ? existing.image : undefined
    if (!image) {
      try { image = await importImage(payload, post) }
      catch (error) { payload.logger.warn({ err: error, msg: `Could not import Instagram image ${post.externalId}` }) }
    }
    if (existing) {
      if (!existing.image && image) await payload.update({ collection: 'instagram-posts', id: existing.id, data: { image } })
      return 0
    }
    await payload.create({ collection: 'instagram-posts', locale: 'de', data: {
      externalId: post.externalId, permalink: post.permalink, caption: post.caption,
      publishedAt: post.publishedAt, image, visible: false,
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
    const imported = await importPosts(payload, data)
    await payload.updateGlobal({ slug: 'instagram-sync-status', data: { snapshotId: null, completedAt: now.toISOString(), lastImportedCount: imported, lastError: null } })
    return { state: 'imported', imported }
  }
  if (!manual && status.startedAt && now.getTime() - new Date(status.startedAt).getTime() < intervalMs) return { state: 'waiting', nextRunAt: new Date(new Date(status.startedAt).getTime() + intervalMs).toISOString() }
  const triggered = object(await brightRequest(`/trigger?dataset_id=${datasetId}&type=discover_new&discover_by=url&format=json`, key, {
    method: 'POST', body: JSON.stringify([{ url: profileUrl, num_of_posts: 12 }]),
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
