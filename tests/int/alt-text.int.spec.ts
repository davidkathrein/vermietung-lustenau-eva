// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../../src/app/api/admin-alt-text/route'
import { generateAltText } from '../../src/lib/alt-text'

const originalKey = process.env.OPENROUTER_API_KEY
const originalModel = process.env.OPENROUTER_ALT_TEXT_MODEL

afterEach(() => {
  vi.restoreAllMocks()
  if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY
  else process.env.OPENROUTER_API_KEY = originalKey
  if (originalModel === undefined) delete process.env.OPENROUTER_ALT_TEXT_MODEL
  else process.env.OPENROUTER_ALT_TEXT_MODEL = originalModel
})

describe('media alt text generation', () => {
  it('requires an authenticated editor', async () => {
    const response = await POST(new Request('http://localhost/api/admin-alt-text', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, targetLocale: 'de' }),
    }))
    expect(response.status).toBe(401)
  })

  it('sends the reduced image with a strict schema and model fallback', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"alt":"Heller Wohnraum mit Sofa und Holztisch"}' } }],
    }), { status: 200 }))

    await expect(generateAltText('https://example.invalid/media/photo-ai.webp', 'de', {
      caption: 'Wohnzimmer', filename: 'room.jpg',
    })).resolves.toBe('Heller Wohnraum mit Sofa und Holztisch')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    const body = JSON.parse(String(init?.body))
    expect(body.model).toBe('google/gemini-3.1-flash-lite')
    expect(body.models).toEqual(['google/gemini-2.5-flash'])
    expect(body.max_tokens).toBe(80)
    expect(body.messages[0].content).toContain('Aim for 8–16 words')
    expect(body.messages[0].content).toContain('Do not list every visible object')
    expect(body.messages[0].content).toContain('Wohn- und Essbereich mit rundem Holztisch')
    expect(body.messages[1].content[1]).toEqual({ type: 'image_url', image_url: { url: 'https://example.invalid/media/photo-ai.webp' } })
    expect(body.response_format.json_schema).toMatchObject({ name: 'media_alt_text', strict: true })
    expect(body.response_format.json_schema.schema.properties.alt.maxLength).toBe(160)
  })

  it('rejects empty or oversized model output', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"alt":""}' } }],
    }), { status: 200 }))
    await expect(generateAltText('https://example.invalid/image.webp', 'en')).rejects.toThrow('Invalid alt text response')
  })

  it('rejects alt text longer than the editorial limit', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ alt: 'x'.repeat(161) }) } }],
    }), { status: 200 }))
    await expect(generateAltText('https://example.invalid/image.webp', 'de')).rejects.toThrow('Invalid alt text response')
  })
})
