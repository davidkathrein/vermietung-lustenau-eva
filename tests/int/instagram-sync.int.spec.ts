// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

import { instagramProfileUrl, parseInstagramPosts, syncInstagram } from '../../src/lib/instagram-sync'
import { GET as cronGET } from '../../src/app/api/internal/instagram-sync/route'
import { POST as adminPOST } from '../../src/app/api/admin-instagram-sync/route'

const originalKey = process.env.BRIGHTDATA_API_KEY
const originalUrl = process.env.INSTAGRAM_PROFILE_URL

afterEach(() => {
  vi.restoreAllMocks()
  if (originalKey === undefined) delete process.env.BRIGHTDATA_API_KEY
  else process.env.BRIGHTDATA_API_KEY = originalKey
  if (originalUrl === undefined) delete process.env.INSTAGRAM_PROFILE_URL
  else process.env.INSTAGRAM_PROFILE_URL = originalUrl
})

describe('Instagram sync', () => {
  it('accepts only a public Instagram profile URL', () => {
    expect(instagramProfileUrl('https://instagram.com/wohnen.lustenau?hl=de')).toBe('https://www.instagram.com/wohnen.lustenau/')
    expect(instagramProfileUrl('https://instagram.com/p/abc/')).toBeNull()
    expect(instagramProfileUrl('https://instagram.com.evil.example/account')).toBeNull()
    expect(instagramProfileUrl('http://instagram.com/account')).toBeNull()
  })

  it('rejects unauthenticated manual and scheduled requests', async () => {
    expect((await adminPOST(new Request('http://localhost/api/admin-instagram-sync', { method: 'POST' }))).status).toBe(401)
    expect((await cronGET(new Request('http://localhost/api/internal/instagram-sync'))).status).toBe(401)
  })

  it('parses the nested Bright Data profile result and removes duplicate or unsafe posts', () => {
    expect(parseInstagramPosts([{ posts: [
      { id: '123', url: 'https://www.instagram.com/p/ABC/?utm_source=test', caption: 'Hallo', datetime: '2026-09-18T10:00:00Z', image_url: 'https://scontent.cdninstagram.com/photo.jpg' },
      { id: '123', url: 'https://www.instagram.com/p/ABC/' },
      { id: '456', url: 'https://evil.example/p/ABC/' },
    ] }])).toEqual([{ externalId: '123', permalink: 'https://www.instagram.com/p/ABC/', caption: 'Hallo', publishedAt: '2026-09-18T10:00:00.000Z', imageUrl: 'https://scontent.cdninstagram.com/photo.jpg' }])
  })

  it('starts a snapshot, waits, then imports without overwriting existing editorial content', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    let state: Record<string, unknown> = {}
    const posts = new Map<string, Record<string, unknown>>()
    const payload = {
      findGlobal: vi.fn(async () => state),
      updateGlobal: vi.fn(async ({ data }: { data: Record<string, unknown> }) => { state = { ...state, ...data }; return state }),
      find: vi.fn(async ({ where }: { where: { externalId: { equals: string } } }) => ({ docs: posts.has(where.externalId.equals) ? [posts.get(where.externalId.equals)] : [] })),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => { posts.set(String(data.externalId), data); return { id: posts.size, ...data } }),
      update: vi.fn(),
      logger: { warn: vi.fn() },
    } as unknown as Payload
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ snapshot_id: 'snap_123' }))
      .mockResolvedValueOnce(Response.json({ status: 'running' }))
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{ posts: [{ id: '123', url: 'https://www.instagram.com/p/ABC/', caption: 'Original', datetime: '2026-09-18T10:00:00Z' }] }]))
      .mockResolvedValueOnce(Response.json({ snapshot_id: 'snap_456' }))
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{ posts: [{ id: '123', url: 'https://www.instagram.com/p/ABC/', caption: 'Changed by scraper' }] }]))

    expect(await syncInstagram(payload, true)).toMatchObject({ state: 'started' })
    expect(fetchMock.mock.calls[0][0]).toContain('type=discover_new&discover_by=url')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual([{ url: 'https://www.instagram.com/example/', num_of_posts: 12 }])
    expect(await syncInstagram(payload)).toMatchObject({ state: 'running' })
    expect(await syncInstagram(payload)).toEqual({ state: 'imported', imported: 1 })
    expect(posts.get('123')).toMatchObject({ caption: 'Original', visible: false })
    expect(state.snapshotId).toBeNull()
    expect(await syncInstagram(payload)).toMatchObject({ state: 'waiting' })
    expect(await syncInstagram(payload, true)).toMatchObject({ state: 'started' })
    expect(await syncInstagram(payload)).toEqual({ state: 'imported', imported: 0 })
    expect(posts.get('123')?.caption).toBe('Original')
    expect(fetchMock).toHaveBeenCalledTimes(7)
  })
})
