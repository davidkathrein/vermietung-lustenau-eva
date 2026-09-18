'use client'

import { useEffect, useRef, useState } from 'react'

import type { Locale, PublicApartment } from '@/lib/public-site'
import type { AvailabilitySelection } from './InquiryForm'

type UnitStatus = {
  slug: string
  state: 'ready' | 'not-connected' | 'error'
  blockedDates: string[]
}
type AvailabilityData = { units: UnitStatus[] }

function dayAfter(day: string, amount = 1) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

function nights(arrival: string, departure: string) {
  const result: string[] = []
  for (let day = arrival; day < departure && result.length < 91; day = dayAfter(day))
    result.push(day)
  return result
}

export function AvailabilityDialog({
  locale,
  apartments,
  selectedSlug,
  seminar = false,
}: {
  locale: Locale
  apartments: PublicApartment[]
  selectedSlug?: string
  seminar?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [monthResult, setMonthResult] = useState<{ key: string; data: AvailabilityData } | null>(
    null,
  )
  const [rangeResult, setRangeResult] = useState<{ key: string; data: AvailabilityData } | null>(
    null,
  )
  const [arrival, setArrival] = useState('')
  const [departure, setDeparture] = useState('')
  const [selected, setSelected] = useState<string[]>(selectedSlug ? [selectedSlug] : [])
  const [open, setOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${month}-01`
  const monthEnd = dayAfter(
    new Date(`${monthStart}T12:00:00Z`).toISOString().slice(0, 10),
    new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate() - 1,
  )
  const range = arrival && departure ? nights(arrival, departure) : []
  const durationValid = seminar ? Boolean(arrival) : range.length >= 2 && range.length <= 90
  const monthKey = `${locale}:${monthStart}:${monthEnd}`
  const rangeThrough = seminar ? arrival : dayAfter(departure || arrival || today, -1)
  const rangeKey = `${locale}:${arrival}:${rangeThrough}`
  const data = monthResult?.key === monthKey ? monthResult.data : null
  const rangeData = rangeResult?.key === rangeKey ? rangeResult.data : null
  const loading = open && !data

  useEffect(() => {
    if (!open || !durationValid) return
    const controller = new AbortController()
    fetch(`/api/public-availability?locale=${locale}&from=${arrival}&through=${rangeThrough}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('availability')
        return response.json() as Promise<AvailabilityData>
      })
      .then((data) => setRangeResult({ key: rangeKey, data }))
      .catch(() => {
        if (!controller.signal.aborted) setRangeResult({ key: rangeKey, data: { units: [] } })
      })
    return () => controller.abort()
  }, [open, locale, arrival, rangeThrough, durationValid, rangeKey])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    fetch(`/api/public-availability?locale=${locale}&from=${monthStart}&through=${monthEnd}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('availability')
        return response.json() as Promise<AvailabilityData>
      })
      .then((data) => setMonthResult({ key: monthKey, data }))
      .catch(() => {
        if (!controller.signal.aborted) setMonthResult({ key: monthKey, data: { units: [] } })
      })
    return () => controller.abort()
  }, [open, locale, monthStart, monthEnd, monthKey])

  function changeMonth(offset: number) {
    const date = new Date(`${monthStart}T12:00:00Z`)
    date.setUTCMonth(date.getUTCMonth() + offset)
    setMonth(date.toISOString().slice(0, 7))
  }

  function stateFor(day: string) {
    if (!data || data.units.length < apartments.length) return 'unknown'
    const relevant = selectedSlug
      ? data.units.filter((unit) => unit.slug === selectedSlug)
      : data.units
    if (relevant.length === 0) return 'unknown'
    if (seminar)
      return relevant.some((unit) => unit.blockedDates.includes(day)) ? 'none' : 'unknown'
    if (selectedSlug && relevant[0].blockedDates.includes(day)) return 'none'
    if (relevant.every((unit) => unit.blockedDates.includes(day))) return 'none'
    if (relevant.some((unit) => unit.state !== 'ready')) return 'unknown'
    const free = relevant.filter((unit) => !unit.blockedDates.includes(day)).length
    return free === 0
      ? 'none'
      : selectedSlug
        ? 'all'
        : free === 3
          ? 'all'
          : free === 2
            ? 'two'
            : 'one'
  }

  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()
  const startOffset = (new Date(`${monthStart}T12:00:00Z`).getUTCDay() + 6) % 7
  const dates = Array.from(
    { length: daysInMonth },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`,
  )
  const available =
    durationValid && rangeData
      ? rangeData.units
          .filter(
            (unit) =>
              unit.state === 'ready' && range.every((day) => !unit.blockedDates.includes(day)),
          )
          .map((unit) => unit.slug)
      : []
  const unknown =
    durationValid && rangeData
      ? rangeData.units
          .filter(
            (unit) =>
              unit.state !== 'ready' && range.every((day) => !unit.blockedDates.includes(day)),
          )
          .map((unit) => unit.slug)
      : []
  const possible = new Set([...available, ...unknown])
  const seminarBlocked = Boolean(
    seminar &&
    selectedSlug &&
    rangeData?.units.find((unit) => unit.slug === selectedSlug)?.blockedDates.includes(arrival),
  )
  const canContinue =
    Boolean(arrival) &&
    (seminar
      ? Boolean(rangeData?.units.some((unit) => unit.slug === selectedSlug) && !seminarBlocked)
      : durationValid &&
        (selectedSlug ? possible.has(selectedSlug) : selected.some((slug) => possible.has(slug))))

  function takeSelection() {
    const slugs = selectedSlug ? [selectedSlug] : selected.filter((slug) => possible.has(slug))
    if (!arrival || (!seminar && !durationValid) || slugs.length === 0) return
    window.dispatchEvent(
      new CustomEvent<AvailabilitySelection>('availability-selection', {
        detail: {
          arrival,
          departure: seminar ? undefined : departure,
          slugs,
          kind: seminar ? 'seminar' : 'stay',
        },
      }),
    )
    dialog.current?.close()
  }

  return (
    <>
      <button
        type="button"
        className="text-link availability-trigger"
        onClick={() => {
          dialog.current?.showModal()
          setOpen(true)
        }}
      >
        {locale === 'de' ? 'Verfügbarkeit ansehen' : 'View availability'} <span aria-hidden>↗</span>
      </button>
      <dialog
        ref={dialog}
        className="availability-dialog"
        onClose={() => setOpen(false)}
        aria-labelledby="availability-title"
      >
        <div className="dialog-top">
          <div>
            <span className="eyebrow">{locale === 'de' ? 'Kalender' : 'Calendar'}</span>
            <h2 id="availability-title">{locale === 'de' ? 'Verfügbarkeit' : 'Availability'}</h2>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={() => dialog.current?.close()}
            aria-label={locale === 'de' ? 'Schließen' : 'Close'}
          >
            ×
          </button>
        </div>
        <p className="dialog-note">
          {locale === 'de'
            ? 'Die Farben zeigen Übernachtungsnächte laut zuletzt abrufbaren Kalendern. Eine Anfrage ist keine Reservierung.'
            : 'Colors show overnight availability according to the last fetched calendars. An inquiry is not a reservation.'}
        </p>
        <div className="month-nav">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label={locale === 'de' ? 'Voriger Monat' : 'Previous month'}
          >
            ←
          </button>
          <strong>
            {new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            }).format(new Date(`${monthStart}T12:00:00Z`))}
          </strong>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label={locale === 'de' ? 'Nächster Monat' : 'Next month'}
          >
            →
          </button>
        </div>
        <div className="calendar-grid" aria-busy={loading}>
          {(locale === 'de'
            ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
            : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
          ).map((name) => (
            <span className="weekday" key={name}>
              {name}
            </span>
          ))}
          {Array.from({ length: startOffset }, (_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {dates.map((day) => {
            const state = stateFor(day)
            return (
              <button
                key={day}
                type="button"
                disabled={day < today}
                className={`calendar-day status-${state} ${day === arrival ? 'is-arrival' : ''} ${day === departure ? 'is-departure' : ''}`}
                onClick={() => {
                  if (seminar) setArrival(day)
                  else if (!arrival || departure || day <= arrival) {
                    setArrival(day)
                    setDeparture('')
                  } else setDeparture(day)
                }}
                aria-label={`${day}: ${state === 'unknown' ? (locale === 'de' ? 'unbekannt' : 'unknown') : state === 'none' ? (locale === 'de' ? 'belegt' : 'blocked') : locale === 'de' ? 'ohne bekannte Sperre' : 'no known block'}`}
              >
                <span>{Number(day.slice(-2))}</span>
                <i aria-hidden />
              </button>
            )
          })}
        </div>
        <div className="calendar-legend">
          {(
            [
              ['all', locale === 'de' ? '3 frei' : '3 free'],
              ['two', locale === 'de' ? '2 frei' : '2 free'],
              ['one', locale === 'de' ? '1 frei' : '1 free'],
              ['none', locale === 'de' ? 'belegt' : 'blocked'],
              ['unknown', locale === 'de' ? 'unbekannt' : 'unknown'],
            ] as const
          ).map(([state, label]) => (
            <span key={state}>
              <i className={`status-${state}`} />
              {label}
            </span>
          ))}
        </div>
        <div className="dialog-selection">
          <p>
            {seminar
              ? locale === 'de'
                ? 'Seminartag wählen'
                : 'Choose a seminar date'
              : locale === 'de'
                ? 'Anreise und Abreise wählen, mindestens zwei Nächte'
                : 'Choose arrival and departure, at least two nights'}
          </p>
          <strong>
            {arrival || '—'} {seminar ? '' : `→ ${departure || '—'}`}
          </strong>
          {durationValid && !seminar && (
            <div className="range-units">
              <p>
                {locale === 'de'
                  ? 'Über alle Nächte ohne bekannte Sperre:'
                  : 'No known block throughout the stay:'}
              </p>
              {apartments.map((unit) => (
                <label key={unit.slug}>
                  <input
                    type="checkbox"
                    checked={selectedSlug === unit.slug || selected.includes(unit.slug)}
                    disabled={Boolean(selectedSlug) || !possible.has(unit.slug)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, unit.slug]
                          : current.filter((slug) => slug !== unit.slug),
                      )
                    }
                  />
                  {unit.name}{' '}
                  {unknown.includes(unit.slug)
                    ? locale === 'de'
                      ? '(Prüfung nötig)'
                      : '(needs checking)'
                    : available.includes(unit.slug)
                      ? ''
                      : locale === 'de'
                        ? '(belegt)'
                        : '(blocked)'}
                </label>
              ))}
            </div>
          )}
          {seminar && arrival && (
            <p className="seminar-caution">
              {locale === 'de'
                ? 'Seminartermine werden immer manuell geprüft.'
                : 'Seminar dates are always checked manually.'}
            </p>
          )}
          <button type="button" className="button" onClick={takeSelection} disabled={!canContinue}>
            {locale === 'de' ? 'In Anfrage übernehmen' : 'Use in inquiry'}{' '}
            <span aria-hidden>↗</span>
          </button>
        </div>
      </dialog>
    </>
  )
}
