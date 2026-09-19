// @vitest-environment node
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MediaFigure } from '../../src/components/site/MediaFigure'
import type { Media } from '../../src/payload-types'

function media(overrides: Partial<Media>): Media {
  return {
    id: 1,
    alt: 'Wohnzimmer mit Sofa',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    url: '/media/living-room.jpg',
    ...overrides,
  }
}

describe('media accessibility', () => {
  it('renders the stored alt text for informative media', () => {
    expect(renderToStaticMarkup(createElement(MediaFigure, { media: media({ decorative: false }) })))
      .toContain('alt="Wohnzimmer mit Sofa"')
  })

  it('keeps decorative media in the page with an empty rendered alt attribute', () => {
    expect(renderToStaticMarkup(createElement(MediaFigure, { media: media({ decorative: true }) })))
      .toContain('alt=""')
  })
})
