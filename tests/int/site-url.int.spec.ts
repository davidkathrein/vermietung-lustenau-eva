import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSiteURL, hasCanonicalSiteURL, isSiteIndexable } from '../../src/lib/site-url'

afterEach(() => vi.unstubAllEnvs())

describe('canonical site URL', () => {
  it('indexes only an HTTPS production origin', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://wohnen.example')

    expect(getSiteURL().origin).toBe('https://wohnen.example')
    expect(hasCanonicalSiteURL()).toBe(true)
    expect(isSiteIndexable()).toBe(true)
  })

  it('keeps preview deployments out of search results', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://wohnen.example')

    expect(isSiteIndexable()).toBe(false)
  })

  it('fails closed for an insecure production origin', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://wohnen.example')

    expect(hasCanonicalSiteURL()).toBe(false)
    expect(getSiteURL().origin).toBe('http://localhost:3000')
    expect(isSiteIndexable()).toBe(false)
  })
})
