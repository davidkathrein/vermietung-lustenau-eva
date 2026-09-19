export function validCalendarDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const monthNames = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const

const parsedMonthNames = new Map<string, number>(
  [...monthNames.de, ...monthNames.en].map((month, index) => [
    month.toLocaleLowerCase('de-AT'),
    (index % 12) + 1,
  ]),
)

function calendarDay(year: number, month: number, day: number): string | null {
  const value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return validCalendarDay(value) ? value : null
}

export function parseCalendarDayInput(value: string, referenceDay: string): string | null {
  const input = value.trim()
  if (!input || !validCalendarDay(referenceDay)) return null

  const referenceYear = Number(referenceDay.slice(0, 4))

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    return calendarDay(year, month, day)
  }

  if (/^\d{4}$/.test(input)) {
    return calendarDay(referenceYear, Number(input.slice(2, 4)), Number(input.slice(0, 2)))
  }

  if (/^\d{6}$/.test(input)) {
    return calendarDay(2000 + Number(input.slice(4, 6)), Number(input.slice(2, 4)), Number(input.slice(0, 2)))
  }

  if (/^\d{8}$/.test(input)) {
    return calendarDay(Number(input.slice(4, 8)), Number(input.slice(2, 4)), Number(input.slice(0, 2)))
  }

  const numeric = input.match(/^(\d{1,2})\s*[.\/\-\s]\s*(\d{1,2})(?:\s*[.\/\-\s]\s*(\d{2}|\d{4}))?[.\/-]?$/)
  if (numeric) {
    const year = numeric[3]
      ? numeric[3].length === 2 ? 2000 + Number(numeric[3]) : Number(numeric[3])
      : referenceYear
    return calendarDay(year, Number(numeric[2]), Number(numeric[1]))
  }

  const readable = input.match(/^(\d{1,2})\s+([A-Za-zÄÖÜäöü]{3,4})\.?\s+(\d{2}|\d{4})$/)
  if (readable) {
    const month = parsedMonthNames.get(readable[2].toLocaleLowerCase('de-AT'))
    if (!month) return null
    const year = readable[3].length === 2 ? 2000 + Number(readable[3]) : Number(readable[3])
    return calendarDay(year, month, Number(readable[1]))
  }

  return null
}

export function formatCalendarDay(value: string, locale: 'de' | 'en'): string {
  if (!validCalendarDay(value)) return value
  const [, month, day] = value.split('-').map(Number)
  return `${String(day).padStart(2, '0')} ${monthNames[locale][month - 1]} ${value.slice(0, 4)}`
}

export function addCalendarDays(value: string, days: number): string {
  if (!validCalendarDay(value)) return value
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addCalendarYears(value: string, years: number): string {
  if (!validCalendarDay(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  const targetYear = year + years
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate()
  return calendarDay(targetYear, month, Math.min(day, lastDay)) ?? value
}

export function todayInVienna(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}
