import { describe, expect, it } from 'vitest'

import {
  addCalendarDays,
  addCalendarYears,
  formatCalendarDay,
  parseCalendarDayInput,
} from '../../src/lib/calendar-day'

describe('calendar day input', () => {
  const referenceDay = '2026-09-19'

  it.each([
    ['2009', '2026-09-20'],
    ['200926', '2026-09-20'],
    ['20092026', '2026-09-20'],
    ['20.9', '2026-09-20'],
    ['20.09.26', '2026-09-20'],
    ['20/9/2026', '2026-09-20'],
    ['20-09-2026', '2026-09-20'],
    ['20 09 2026', '2026-09-20'],
    ['2026-09-20', '2026-09-20'],
    ['20 Sep 2026', '2026-09-20'],
    ['20 Mär 2027', '2027-03-20'],
  ])('parses %s as %s', (input, expected) => {
    expect(parseCalendarDayInput(input, referenceDay)).toBe(expected)
  })

  it.each(['209', '3102', '000926', '321399', 'tomorrow', '20 September 2026'])('rejects %s', (input) => {
    expect(parseCalendarDayInput(input, referenceDay)).toBeNull()
  })

  it('formats a compact localized display value', () => {
    expect(formatCalendarDay('2027-03-20', 'de')).toBe('20 Mär 2027')
    expect(formatCalendarDay('2027-03-20', 'en')).toBe('20 Mar 2027')
    expect(formatCalendarDay('2027-05-20', 'de')).toBe('20 Mai 2027')
    expect(formatCalendarDay('2027-05-20', 'en')).toBe('20 May 2027')
  })

  it('uses calendar arithmetic for range boundaries', () => {
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addCalendarYears('2028-02-29', 3)).toBe('2031-02-28')
  })
})
