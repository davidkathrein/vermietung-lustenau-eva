import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { pageBlocks } from '../../src/blocks/pageBlocks'
import { InstagramFeed } from '../../src/components/site/InstagramFeed'
import { PageBlocks } from '../../src/components/site/PageBlocks'
import type { Page } from '../../src/payload-types'

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Instagram page block', () => {
  it('is available in the Pages block picker with localized copy fields and its preview image', () => {
    const block = pageBlocks.find((candidate) => candidate.slug === 'instagramFeed')

    expect(block?.fields.map((field) => ('name' in field ? field.name : null))).toEqual([
      'eyebrow',
      'headline',
      'intro',
    ])
    expect(block?.admin?.images?.thumbnail).toEqual({
      url: '/admin/block-previews/instagramFeed.webp',
      alt: 'Vorschau des Instagram-Bereichs',
    })
  })

  it('renders only where the block is placed and uses its translated heading copy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        profileUrl: 'https://www.instagram.com/starkgemachtverein/',
        posts: Array.from({ length: 6 }, (_, index) => ({
          id: `post-${index + 1}`,
          permalink: `https://www.instagram.com/p/example-${index + 1}/`,
          caption: index === 0 ? 'Ein aktueller Beitrag' : `Beitrag ${index + 1}`,
          publishedAt: null,
          imageUrl: null,
          imageAlt: '',
          imageCaption: '',
          isReel: false,
        })),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const page = {
      internalName: 'homepage',
      layout: [
        {
          blockType: 'instagramFeed',
          headline: 'Neu auf Instagram',
          intro: 'Direkt aus dem Vereinsleben.',
        },
      ],
    } as unknown as Page

    const view = render(createElement(PageBlocks, { page, locale: 'de', accommodations: [] }))

    await waitFor(() =>
      expect(view.getByRole('heading', { name: 'Neu auf Instagram' })).toBeTruthy(),
    )
    expect(view.getByText('Direkt aus dem Vereinsleben.')).toBeTruthy()
    expect(view.getByText('Ein aktueller Beitrag')).toBeTruthy()
    expect(view.getByRole('group', { name: 'Instagram-Seiten' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Vorherige Instagram-Beiträge' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Nächste Instagram-Beiträge' })).toBeTruthy()
    expect(view.getAllByRole('button', { name: /Seite \d+ von 6/ })).toHaveLength(6)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/public-instagram-posts?locale=de',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )

    cleanup()
    fetchMock.mockClear()
    render(
      createElement(PageBlocks, {
        page: { ...page, layout: [] },
        locale: 'de',
        accommodations: [],
      }),
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows distinct loading, error, retry, and empty states', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(Response.json({ posts: [], profileUrl: null }))
    vi.stubGlobal('fetch', fetchMock)

    const view = render(
      createElement(InstagramFeed, { locale: 'de', headline: 'Neu auf Instagram' }),
    )

    expect(view.getByText('Instagram-Beiträge werden geladen.')).toBeTruthy()
    await waitFor(() => expect(view.getByRole('alert')).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'Erneut versuchen' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(view.queryByRole('heading', { name: 'Neu auf Instagram' })).toBeNull(),
    )
  })

  it('uses an empty Instagram image alt by default and renders a maintained media alt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      profileUrl: 'https://www.instagram.com/starkgemachtverein/',
      posts: [
        {
          id: 'post-without-alt', permalink: 'https://www.instagram.com/p/without-alt/',
          caption: 'Beitrag ohne Bildbeschreibung', publishedAt: null,
          imageUrl: '/media/instagram-without-alt.jpg', imageAlt: '', imageCaption: '', isReel: false,
        },
        {
          id: 'post-with-alt', permalink: 'https://www.instagram.com/p/with-alt/',
          caption: 'Beitrag mit Bildbeschreibung', publishedAt: null,
          imageUrl: '/media/instagram-with-alt.jpg', imageAlt: 'Seminarraum mit U-förmig angeordneten Tischen', imageCaption: '', isReel: false,
        },
      ],
    })))

    const view = render(createElement(InstagramFeed, { locale: 'de', headline: 'Instagram' }))
    await waitFor(() => expect(view.container.querySelector('img')).toBeTruthy())
    expect(Array.from(view.container.querySelectorAll('img')).map((image) => image.getAttribute('alt')))
      .toEqual(['', 'Seminarraum mit U-förmig angeordneten Tischen'])
  })
})
