// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { POST } from '../../src/app/api/admin-translate/route'
import { translateFields } from '../../src/lib/translation'
import { buildReviewCandidates, reviewFields, sourceIsComplete, translationUnits } from '../../src/lib/translation-review'

const originalKey = process.env.OPENROUTER_API_KEY

afterEach(() => {
  vi.restoreAllMocks()
  if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY
  else process.env.OPENROUTER_API_KEY = originalKey
})

describe('admin translation', () => {
  it('hides translation until existing link labels are filled', () => {
    expect(sourceIsComplete('site-settings', { siteName: 'Wohnen', navigation: [{ link: { kind: 'internal' } }] })).toBe(false)
    expect(sourceIsComplete('site-settings', { siteName: 'Wohnen', navigation: [{ link: { label: 'Wohnungen' } }] })).toBe(true)
    const page = { slug: 'homepage', title: 'Startseite', seo: { metaTitle: 'Wohnen', metaDescription: 'Lustenau' }, layout: [{ blockType: 'hero', headline: 'Ankommen', actions: [{ link: { kind: 'internal' } }] }] }
    expect(sourceIsComplete('pages', page)).toBe(false)
    page.layout[0].actions[0].link = { kind: 'internal', label: 'Wohnungen' } as typeof page.layout[0]['actions'][0]['link']
    expect(sourceIsComplete('pages', page)).toBe(true)
    expect(sourceIsComplete('pages', { ...page, layout: [{ blockType: 'content', headline: 'Willkommen', action: { kind: 'internal' } }] })).toBe(true)
    expect(sourceIsComplete('pages', { ...page, layout: [{ blockType: 'content', headline: 'Willkommen', action: { kind: 'internal', reference: 2 } }] })).toBe(false)
  })
  it('requires authentication before attempting translation', async () => {
    const request = new Request('http://localhost/api/admin-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'accommodations', id: 1, targetLocale: 'en' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('extracts localized copy and keeps captions on media', () => {
    expect(reviewFields('accommodations', {
      slug: 'wohnung-eins', name: 'Wohnung Eins', teaser: 'Kurztext', description: '', sleeps: 4,
      gallery: [{ caption: 'Aussicht', image: 7 }],
    })).toEqual([
      { path: 'slug', kind: 'slug', value: 'wohnung-eins' },
      { path: 'name', kind: 'text', value: 'Wohnung Eins' },
      { path: 'teaser', kind: 'text', value: 'Kurztext' },
    ])
    expect(reviewFields('site-settings', { siteName: 'Lustenau', country: 'Österreich', contactEmail: 'private@example.invalid' }))
      .toEqual([{ path: 'siteName', kind: 'text', value: 'Lustenau' }, { path: 'country', kind: 'text', value: 'Österreich' }])
    expect(reviewFields('media', { alt: 'Hausfront', caption: 'Abendlicht', filename: 'photo.jpg' }))
      .toEqual([{ path: 'alt', kind: 'text', value: 'Hausfront' }, { path: 'caption', kind: 'text', value: 'Abendlicht' }])
    expect(reviewFields('instagram-posts', { caption: 'Ein Blick in die Wohnung', permalink: 'https://www.instagram.com/p/example/' }))
      .toEqual([{ path: 'caption', kind: 'text', value: 'Ein Blick in die Wohnung' }])
  })

  it('translates rich text in context while rejecting formatting or link changes', () => {
    const value = { root: { type: 'root', children: [{ type: 'paragraph', children: [
      { type: 'text', text: 'Enjoy ', format: 0 }, { type: 'text', text: 'your stay', format: 1 },
    ] }] } }
    const field = { path: 'layout.0.body', kind: 'richText' as const, value }
    expect(translationUnits([field])).toEqual([{ path: field.path, text: JSON.stringify(value) }])
    const translated = structuredClone(value)
    translated.root.children[0].children[0].text = 'Genießen Sie '
    translated.root.children[0].children[1].text = 'Ihren Aufenthalt'
    expect(buildReviewCandidates([field], [{ path: field.path, text: JSON.stringify(translated) }])[0].candidate).toEqual(translated)
    translated.root.children[0].children[1].format = 0
    expect(() => buildReviewCandidates([field], [{ path: field.path, text: JSON.stringify(translated) }])).toThrow('formatting changed')
  })

  it('accepts structured translations without saving or returning provider metadata', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
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
    expect(JSON.parse(String(init?.body)).response_format.json_schema.strict).toBe(true)
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
      choices: [{ message: { content: '{"0":"apartment-one","1":"Apartment One","2":"English copy"}' } }],
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
        { path: 'slug', kind: 'slug', source: unit.slug, candidate: 'apartment-one' },
        { path: 'name', kind: 'text', source: 'Wohnung Eins', candidate: 'Apartment One' },
        { path: 'teaser', kind: 'text', source: 'Deutscher Text', candidate: 'English copy' },
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
