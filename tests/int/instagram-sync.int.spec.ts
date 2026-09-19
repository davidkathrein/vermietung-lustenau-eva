// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import sharp from 'sharp'

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

  it('reads Bright Data post IDs and photo or reel thumbnails', () => {
    expect(parseInstagramPosts([
      { post_id: 'photo-1', url: 'https://www.instagram.com/p/PHOTO/', description: 'Foto', date_posted: '2026-09-18T10:00:00Z', photos: ['https://scontent.cdninstagram.com/photo.jpg'] },
      { post_id: 'reel-1', url: 'https://www.instagram.com/reel/REEL/', description: 'Video', thumbnail: 'https://scontent.cdninstagram.com/reel.jpg', videos: ['https://scontent.cdninstagram.com/reel.mp4'] },
    ])).toEqual([
      { externalId: 'photo-1', permalink: 'https://www.instagram.com/p/PHOTO/', caption: 'Foto', publishedAt: '2026-09-18T10:00:00.000Z', imageUrl: 'https://scontent.cdninstagram.com/photo.jpg' },
      { externalId: 'reel-1', permalink: 'https://www.instagram.com/reel/REEL/', caption: 'Video', publishedAt: undefined, imageUrl: 'https://scontent.cdninstagram.com/reel.jpg' },
    ])
  })

  it('selects the largest available Instagram image variant', () => {
    expect(parseInstagramPosts([{
      post_id: 'largest-image',
      url: 'https://www.instagram.com/p/LARGEST/',
      thumbnail: { url: 'https://scontent.cdninstagram.com/thumb.jpg', width: 320, height: 320 },
      images: [
        { url: 'https://scontent.cdninstagram.com/medium.jpg', width: 640, height: 640 },
        { url: 'https://scontent.cdninstagram.com/large.jpg', width: 1080, height: 1080 },
      ],
    }])).toEqual([{
      externalId: 'largest-image',
      permalink: 'https://www.instagram.com/p/LARGEST/',
      caption: undefined,
      publishedAt: undefined,
      imageUrl: 'https://scontent.cdninstagram.com/large.jpg',
    }])
  })

  it('includes Bright Data validation details without exposing the response body', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const payload = {
      findGlobal: vi.fn(async () => ({})),
      updateGlobal: vi.fn(),
    } as unknown as Payload
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(
      { error: 'Invalid input provided', code: 'validation_error', input: { apiKey: 'must-not-leak' } },
      { status: 400 },
    ))

    const error = await syncInstagram(payload, true).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Bright Data returned HTTP 400: Invalid input provided')
    expect((error as Error).message).not.toContain('must-not-leak')
  })

  it('includes a short plain-text Bright Data account error', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const payload = {
      findGlobal: vi.fn(async () => ({})),
      updateGlobal: vi.fn(),
    } as unknown as Payload
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Customer is not active', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 400,
    }))

    const error = await syncInstagram(payload, true).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Bright Data returned HTTP 400: Customer is not active')
  })

  it('marks automatically imported Instagram media as decorative', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const image = await sharp({
      create: { width: 2, height: 2, channels: 3, background: '#ffffff' },
    }).jpeg().toBuffer()
    const create = vi.fn(async ({ collection, data }: { collection: string; data: Record<string, unknown> }) =>
      collection === 'media' ? { id: 22, ...data } : { id: 23, ...data })
    const payload = {
      findGlobal: vi.fn(async () => ({ snapshotId: 'snap_decorative', profileUrl: 'https://www.instagram.com/example/' })),
      updateGlobal: vi.fn(),
      find: vi.fn(async () => ({ docs: [] })),
      create,
      update: vi.fn(),
      logger: { warn: vi.fn() },
    } as unknown as Payload
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{
        post_id: 'decorative',
        url: 'https://www.instagram.com/p/DECORATIVE/',
        image_url: 'https://scontent.cdninstagram.com/decorative.jpg',
      }]))
      .mockResolvedValueOnce(new Response(new Uint8Array(image), {
        headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(image.length) },
      }))

    await expect(syncInstagram(payload)).resolves.toEqual({ state: 'imported', imported: 1 })
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'media',
      data: { alt: '', decorative: true },
    }))
  })

  it('reuses an imported media item when the post relationship is missing', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const update = vi.fn()
    const create = vi.fn()
    const payload = {
      findGlobal: vi.fn(async () => ({
        snapshotId: 'snap_reconnect',
        profileUrl: 'https://www.instagram.com/example/',
        startedAt: '2026-09-19T10:00:00.000Z',
      })),
      updateGlobal: vi.fn(),
      find: vi.fn(async ({ collection }: { collection: string }) => collection === 'media'
        ? { docs: [{ id: 21, filename: 'instagram-reconnect.jpg' }] }
        : { docs: [{ id: 7, image: null, sourceProfile: 'https://www.instagram.com/example/' }] }),
      create,
      update,
      logger: { warn: vi.fn() },
    } as unknown as Payload
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{
        post_id: 'reconnect',
        url: 'https://www.instagram.com/p/RECONNECT/',
        image_url: 'https://scontent.cdninstagram.com/reconnect.jpg',
      }]))

    await expect(syncInstagram(payload)).resolves.toEqual({ state: 'imported', imported: 0 })
    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'instagram-posts',
      id: 7,
      data: { image: 21 },
    }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('upgrades an automatically imported image when the scraper provides a larger file', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const image = await sharp({
      create: { width: 2, height: 2, channels: 3, background: '#ffffff' },
    }).png().toBuffer()
    const update = vi.fn()
    const payload = {
      findGlobal: vi.fn(async () => ({
        snapshotId: 'snap_upgrade',
        profileUrl: 'https://www.instagram.com/example/',
        startedAt: '2026-09-19T10:00:00.000Z',
      })),
      updateGlobal: vi.fn(),
      find: vi.fn(async () => ({ docs: [{ id: 7, image: 12, sourceProfile: 'https://www.instagram.com/example/' }] })),
      findByID: vi.fn(async () => ({ id: 12, filename: 'instagram-upgrade.jpg', width: 1, height: 1 })),
      create: vi.fn(),
      update,
      logger: { warn: vi.fn() },
    } as unknown as Payload
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{
        post_id: 'upgrade',
        url: 'https://www.instagram.com/p/UPGRADE/',
        image_url: 'https://scontent.cdninstagram.com/upgrade.png',
      }]))
      .mockResolvedValueOnce(new Response(new Uint8Array(image), {
        headers: { 'Content-Type': 'image/png', 'Content-Length': String(image.length) },
      }))

    await expect(syncInstagram(payload)).resolves.toEqual({ state: 'imported', imported: 0 })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'media',
      id: 12,
      file: expect.objectContaining({ name: 'instagram-upgrade.png' }),
    }))
  })

  it('does not replace an editorial image attached to an imported post', async () => {
    process.env.BRIGHTDATA_API_KEY = 'test-key'
    process.env.INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/example/'
    const update = vi.fn()
    const payload = {
      findGlobal: vi.fn(async () => ({
        snapshotId: 'snap_editorial',
        profileUrl: 'https://www.instagram.com/example/',
        startedAt: '2026-09-19T10:00:00.000Z',
      })),
      updateGlobal: vi.fn(),
      find: vi.fn(async () => ({ docs: [{ id: 8, image: 13, sourceProfile: 'https://www.instagram.com/example/' }] })),
      findByID: vi.fn(async () => ({ id: 13, filename: 'editorial-image.jpg', width: 1, height: 1 })),
      create: vi.fn(),
      update,
      logger: { warn: vi.fn() },
    } as unknown as Payload
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ status: 'ready' }))
      .mockResolvedValueOnce(Response.json([{
        post_id: 'editorial',
        url: 'https://www.instagram.com/p/EDITORIAL/',
        image_url: 'https://scontent.cdninstagram.com/editorial.png',
      }]))

    await expect(syncInstagram(payload)).resolves.toEqual({ state: 'imported', imported: 0 })
    expect(update).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(2)
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
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1vikfch901nx3by4&include_errors=true')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual([{ url: 'https://www.instagram.com/example/' }])
    expect(await syncInstagram(payload)).toMatchObject({ state: 'running' })
    expect(await syncInstagram(payload)).toEqual({ state: 'imported', imported: 1 })
    expect(posts.get('123')).toMatchObject({ caption: 'Original', sourceProfile: 'https://www.instagram.com/example/', visible: true })
    expect(state.snapshotId).toBeNull()
    expect(await syncInstagram(payload)).toMatchObject({ state: 'waiting' })
    expect(await syncInstagram(payload, true)).toMatchObject({ state: 'started' })
    expect(await syncInstagram(payload)).toEqual({ state: 'imported', imported: 0 })
    expect(posts.get('123')?.caption).toBe('Original')
    expect(fetchMock).toHaveBeenCalledTimes(7)
  })
})
