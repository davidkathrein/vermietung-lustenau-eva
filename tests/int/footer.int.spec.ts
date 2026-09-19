// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { hrefForLink } from '../../src/lib/href'
import { getPublicSettings } from '../../src/lib/public-content'

describe('editable footer', () => {
  it('stores localized footer copy and renders configured links through the shared link model', async () => {
    const payload = await getPayload({ config })
    const german = await payload.updateGlobal({
      slug: 'site-settings', locale: 'de',
      data: { footer: { title: 'Wohnen am Rhein', apartmentsHeading: 'Unsere Räume', links: [
        { link: { label: 'Schreiben Sie uns', kind: 'email', email: 'kontakt@example.invalid' } },
      ] } },
    })
    const linkId = german.footer?.links?.[0]?.id
    expect(linkId).toBeTruthy()
    await payload.updateGlobal({
      slug: 'site-settings', locale: 'en',
      data: { footer: { title: 'Stay by the Rhine', apartmentsHeading: 'Our spaces', links: [
        { id: linkId, link: { label: 'Email us', kind: 'email', email: 'kontakt@example.invalid' } },
      ] } },
    })

    const [de, en] = await Promise.all([getPublicSettings('de'), getPublicSettings('en')])
    expect(de.footer?.title).toBe('Wohnen am Rhein')
    expect(de.footer?.apartmentsHeading).toBe('Unsere Räume')
    expect(de.footer?.links?.[0]?.link.label).toBe('Schreiben Sie uns')
    expect(en.footer?.title).toBe('Stay by the Rhine')
    expect(en.footer?.links?.[0]?.link.label).toBe('Email us')
    expect(hrefForLink(de.footer?.links?.[0]?.link, 'de')).toBe('mailto:kontakt@example.invalid')
  })
})
