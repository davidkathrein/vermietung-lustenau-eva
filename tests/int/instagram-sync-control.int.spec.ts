import { render } from '@testing-library/react'
import { createElement, type ButtonHTMLAttributes, type PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payloadcms/ui', () => ({
  Gutter: ({ children, className }: PropsWithChildren<{ className?: string }>) => createElement(
    'div',
    { className: `gutter ${className ?? ''}` },
    children,
  ),
  useTranslation: () => ({ i18n: { language: 'de' } }),
}))

vi.mock('@/components/ui/button', () => ({
  Button: (props: ButtonHTMLAttributes<HTMLButtonElement>) => createElement('button', props),
}))

import InstagramSyncControl from '../../src/components/instagram/InstagramSyncControl'

afterEach(() => vi.unstubAllGlobals())

describe('Instagram sync control', () => {
  it('uses the Payload list gutter so the control aligns with the collection content', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)))
    const view = render(createElement(InstagramSyncControl))
    const section = view.container.querySelector('section[aria-label="Instagram-Abgleich"]')

    expect(section?.parentElement?.classList.contains('gutter')).toBe(true)
    view.unmount()
  })
})
