// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { Media } from '../../src/collections/Media'

const altField = Media.fields.find((field) => 'name' in field && field.name === 'alt')

if (!altField || !('validate' in altField) || typeof altField.validate !== 'function') {
  throw new Error('Media alt validation is not configured')
}

const validateAlt = altField.validate
const validationOptions = (decorative: boolean) =>
  ({ data: { decorative }, siblingData: { decorative } }) as never

describe('media alt validation', () => {
  it('allows an empty alt for decorative media', async () => {
    expect(await validateAlt('', validationOptions(true))).toBe(true)
  })

  it('requires an alt for non-decorative media', async () => {
    expect(await validateAlt('', validationOptions(false))).toContain('Alternativtext')
    expect(
      await validateAlt('Wohnbereich mit großem Fenster', validationOptions(false)),
    ).toBe(true)
  })
})
