// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { POST } from '../../src/app/api/admin-translate/route'
import { translateFields } from '../../src/lib/translation'
import { translationFields } from '../../src/lib/translation-fields'

const originalKey = process.env.OPENROUTER_API_KEY
const originalModel = process.env.OPENROUTER_MODEL

afterEach(() => {
  vi.restoreAllMocks()
  if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY
  else process.env.OPENROUTER_API_KEY = originalKey
  if (originalModel === undefined) delete process.env.OPENROUTER_MODEL
  else process.env.OPENROUTER_MODEL = originalModel
})

describe('admin translation', () => {
  it('requires authentication before attempting translation', async () => {
    const request = new Request('http://localhost/api/admin-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'accommodations', id: 1, targetLocale: 'en' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('extracts only saved, localized copy including gallery captions', () => {
    expect(translationFields('accommodations', {
      name: 'Wohnung Eins', teaser: 'Kurztext', description: '', sleeps: 4,
      gallery: [{ caption: 'Aussicht', image: 7 }, { caption: '   ', image: 8 }],
    })).toEqual([
      { path: 'name', text: 'Wohnung Eins' },
      { path: 'teaser', text: 'Kurztext' },
      { path: 'gallery.0.caption', text: 'Aussicht' },
    ])
    expect(translationFields('site-settings', { siteName: 'Lustenau', country: 'Österreich', contactEmail: 'private@example.invalid' }))
      .toEqual([{ path: 'siteName', text: 'Lustenau' }, { path: 'country', text: 'Österreich' }])
    expect(translationFields('media', { alt: 'Hausfront', filename: 'photo.jpg' }))
      .toEqual([{ path: 'alt', text: 'Hausfront' }])
  })

  it('accepts structured translations without saving or returning provider metadata', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    delete process.env.OPENROUTER_MODEL
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"0":"Apartment One","1":"View"}' } }],
    }), { status: 200 }))

    const fields = await translateFields([
      { path: 'name', text: 'Wohnung Eins' },
      { path: 'gallery.0.caption', text: 'Aussicht' },
    ], 'de', 'en')

    expect(fields).toEqual([
      { path: 'name', text: 'Apartment One' },
      { path: 'gallery.0.caption', text: 'View' },
    ])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(JSON.parse(String(init?.body)).model).toBe('deepseek/deepseek-v4-flash-0731:free')
    expect(JSON.parse(String(init?.body)).response_format.json_schema.strict).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries once with the paid DeepSeek model when the free model is rate limited', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    delete process.env.OPENROUTER_MODEL
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [{ message: { content: '{"0":"Apartment One"}' } }],
      }), { status: 200 }))

    await expect(translateFields([{ path: 'name', text: 'Wohnung Eins' }], 'de', 'en'))
      .resolves.toEqual([{ path: 'name', text: 'Apartment One' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).model).toBe('deepseek/deepseek-v4-flash-0731:free')
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body)).model).toBe('deepseek/deepseek-v4-flash-0731')
  })

  it('does not use the paid fallback for other provider errors', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    delete process.env.OPENROUTER_MODEL
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 503 }))

    await expect(translateFields([{ path: 'name', text: 'Wohnung Eins' }], 'de', 'en'))
      .rejects.toThrow('Translation provider rejected the request')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reads the saved source locale for an authenticated editor without saving the result', async () => {
    const payload = await getPayload({ config })
    const user = { email: `translation-${Date.now()}@example.invalid`, password: 'local-test-password' }
    const admin = await payload.create({ collection: 'users', data: user })
    const unit = await payload.create({
      collection: 'accommodations', locale: 'de',
      data: { slug: `translation-${Date.now()}`, name: 'Wohnung Eins', teaser: 'Deutscher Text', sleeps: 4 },
    })
    process.env.OPENROUTER_API_KEY = 'test-key'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"0":"Apartment One","1":"English copy"}' } }],
    }), { status: 200 }))

    try {
      const login = await payload.login({ collection: 'users', data: user })
      const response = await POST(new Request('http://localhost/api/admin-translate', {
        method: 'POST',
        headers: { Authorization: `JWT ${login.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'accommodations', id: unit.id, targetLocale: 'en' }),
      }))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ fields: [
        { path: 'name', text: 'Apartment One' },
        { path: 'teaser', text: 'English copy' },
      ] })
      const english = await payload.findByID({ collection: 'accommodations', id: unit.id, locale: 'en', fallbackLocale: false })
      expect(english.name).toBeUndefined()
    } finally {
      await payload.delete({ collection: 'accommodations', id: unit.id })
      await payload.delete({ collection: 'users', id: admin.id })
    }
  })

  it('rejects incomplete model output instead of changing some fields', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"0":"Apartment One"}' } }],
    }), { status: 200 }))
    await expect(translateFields([
      { path: 'name', text: 'Wohnung Eins' }, { path: 'teaser', text: 'Kurztext' },
    ], 'de', 'en')).rejects.toThrow('Incomplete translation response')
  })
})
