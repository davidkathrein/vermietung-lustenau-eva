'use client'

import { useEffect, useState, type FormEvent } from 'react'

import type { Locale, PublicApartment } from '@/lib/public-site'

export type AvailabilitySelection = {
  arrival: string
  departure?: string
  slugs: string[]
  kind: 'stay' | 'seminar'
}

function dayBefore(day: string) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export function InquiryForm({
  locale,
  apartments,
  initialSlugs,
  kind,
}: {
  locale: Locale
  apartments: PublicApartment[]
  initialSlugs: string[]
  kind: 'stay' | 'seminar'
}) {
  const [slugs, setSlugs] = useState(initialSlugs)
  const [arrival, setArrival] = useState('')
  const [departure, setDeparture] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const onSelection = (event: Event) => {
      const selection = (event as CustomEvent<AvailabilitySelection>).detail
      if (selection.kind !== kind) return
      setArrival(selection.arrival)
      setDeparture(selection.departure ?? '')
      setSlugs(selection.slugs)
      document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('availability-selection', onSelection)
    return () => window.removeEventListener('availability-selection', onSelection)
  }, [kind])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (slugs.length === 0) {
      setError(locale === 'de' ? 'Bitte wählen Sie eine Wohnung.' : 'Please choose an apartment.')
      return
    }
    const form = event.currentTarget
    const values = new FormData(form)
    const guests = Number(values.get('guests'))
    if (kind === 'stay') {
      const duration =
        (Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86_400_000
      if (duration < 2 || duration > 90) {
        setError(
          locale === 'de'
            ? 'Bitte wählen Sie einen Aufenthalt von zwei bis 90 Nächten.'
            : 'Please choose a stay of two to 90 nights.',
        )
        return
      }
    }
    setStatus('sending')
    setError('')
    try {
      const through = kind === 'seminar' ? arrival : dayBefore(departure)
      const availability = await fetch(
        `/api/public-availability?locale=${locale}&from=${arrival}&through=${through}`,
      )
      if (availability.ok) {
        const result = (await availability.json()) as {
          units: { slug: string; blockedDates: string[] }[]
        }
        if (
          result.units.some(
            (unit) =>
              slugs.includes(unit.slug) &&
              unit.blockedDates.some((day) => day >= arrival && day <= through),
          )
        ) {
          setStatus('error')
          setError(
            locale === 'de'
              ? 'Für mindestens eine gewählte Wohnung ist dieser Zeitraum bereits gesperrt. Bitte wählen Sie andere Daten.'
              : 'At least one selected apartment is blocked during these dates. Please choose other dates.',
          )
          return
        }
      }
      const response = await fetch('/api/public-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          accommodationSlugs: slugs,
          arrival,
          departure: kind === 'stay' ? departure : undefined,
          name: values.get('name'),
          email: values.get('email'),
          phone: values.get('phone'),
          guests,
          message: values.get('message'),
          company: values.get('company'),
        }),
      })
      if (!response.ok) throw new Error(String(response.status))
      setStatus('sent')
      form.reset()
      setArrival('')
      setDeparture('')
    } catch {
      setStatus('error')
      setError(
        locale === 'de'
          ? 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt.'
          : 'We could not send your inquiry. Please try again or contact us directly.',
      )
    }
  }

  const seminar = kind === 'seminar'
  return (
    <form className="inquiry-form" onSubmit={submit}>
      <fieldset className="unit-choice">
        <legend>
          {seminar
            ? locale === 'de'
              ? 'Seminarraum'
              : 'Seminar room'
            : locale === 'de'
              ? 'Welche Wohnungen?'
              : 'Which apartments?'}
        </legend>
        <div className="unit-options">
          {apartments
            .filter((unit) => !seminar || unit.seminarCapable)
            .map((unit) => (
              <label
                key={unit.slug}
                className={slugs.includes(unit.slug) ? 'unit-option selected' : 'unit-option'}
              >
                <input
                  type={seminar ? 'radio' : 'checkbox'}
                  name="unit"
                  checked={slugs.includes(unit.slug)}
                  onChange={(event) =>
                    setSlugs((current) =>
                      seminar
                        ? [unit.slug]
                        : event.target.checked
                          ? [...current, unit.slug]
                          : current.filter((slug) => slug !== unit.slug),
                    )
                  }
                />
                <span>{unit.name}</span>
              </label>
            ))}
        </div>
      </fieldset>
      <div className="form-row">
        <label>
          {seminar
            ? locale === 'de'
              ? 'Seminartag'
              : 'Seminar date'
            : locale === 'de'
              ? 'Anreise'
              : 'Arrival'}
          <input
            type="date"
            name="arrival"
            required
            min={today}
            value={arrival}
            onChange={(event) => setArrival(event.target.value)}
          />
        </label>
        {!seminar && (
          <label>
            {locale === 'de' ? 'Abreise' : 'Departure'}
            <input
              type="date"
              name="departure"
              required
              min={arrival || today}
              value={departure}
              onChange={(event) => setDeparture(event.target.value)}
            />
          </label>
        )}
      </div>
      <div className="form-row">
        <label>
          {locale === 'de' ? 'Anzahl Personen' : 'Number of guests'}
          <input
            name="guests"
            type="number"
            min="1"
            max={
              seminar
                ? '10'
                : String(
                    apartments
                      .filter((unit) => slugs.includes(unit.slug))
                      .reduce((sum, unit) => sum + unit.sleeps, 0) || 11,
                  )
            }
            required
          />
        </label>
        <label>
          {locale === 'de' ? 'Name' : 'Name'}
          <input name="name" autoComplete="name" maxLength={120} required />
        </label>
      </div>
      <div className="form-row">
        <label>
          {locale === 'de' ? 'E-Mail' : 'Email'}
          <input name="email" type="email" autoComplete="email" maxLength={254} required />
        </label>
        <label>
          {locale === 'de' ? 'Telefon (optional)' : 'Phone (optional)'}
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>
      <label>
        {locale === 'de' ? 'Nachricht (optional)' : 'Message (optional)'}
        <textarea name="message" rows={4} maxLength={2000} />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-footer">
        <p>
          {locale === 'de'
            ? 'Unverbindliche Anfrage · mindestens zwei Nächte bei Übernachtung'
            : 'Non-binding inquiry · minimum two nights for stays'}
        </p>
        <button
          className="button"
          type="submit"
          disabled={status === 'sending' || apartments.length === 0}
        >
          {status === 'sending'
            ? locale === 'de'
              ? 'Wird gesendet…'
              : 'Sending…'
            : locale === 'de'
              ? 'Anfrage senden'
              : 'Send inquiry'}{' '}
          <span aria-hidden>↗</span>
        </button>
      </div>
      {status === 'sent' && (
        <p className="form-message success" role="status">
          {locale === 'de'
            ? 'Ihre Anfrage wurde gespeichert. Wir melden uns nach der Kalenderprüfung.'
            : 'Your inquiry has been saved. We will reply after checking the calendars.'}
        </p>
      )}
      {error && (
        <p className="form-message error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
