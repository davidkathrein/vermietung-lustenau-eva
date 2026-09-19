'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { addCalendarDays, addCalendarYears, formatCalendarDay, parseCalendarDayInput, todayInVienna } from '@/lib/calendar-day'
import type { SiteLocale } from '@/lib/locale'
import type { Accommodation } from '@/payload-types'

import { DateInput } from './DateInput'

type AvailabilityUnit = { accommodationId: number; state: 'ready' | 'not-connected' | 'error'; blockedDates: string[]; checkedAt?: string }
type AvailabilityResponse = { units: AvailabilityUnit[] }

function plusMonths(day: string, months: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function previousDay(day: string): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

type DateInputResult = { day: string; error: null } | { day: ''; error: string }

function validateDateInput(value: string, referenceDay: string, minDay: string, maxDay: string, locale: SiteLocale): DateInputResult {
  if (!value.trim()) {
    return { day: '', error: locale === 'de' ? 'Bitte gib ein Datum ein.' : 'Please enter a date.' }
  }

  const day = parseCalendarDayInput(value, referenceDay)
  if (!day) {
    return { day: '', error: locale === 'de' ? 'Bitte gib ein gültiges Datum ein.' : 'Please enter a valid date.' }
  }
  if (day < minDay) {
    return {
      day: '',
      error: locale === 'de'
        ? `Bitte wähle ein Datum ab ${formatCalendarDay(minDay, locale)}.`
        : `Please choose a date on or after ${formatCalendarDay(minDay, locale)}.`,
    }
  }
  if (day > maxDay) {
    return {
      day: '',
      error: locale === 'de'
        ? `Bitte wähle ein Datum bis ${formatCalendarDay(maxDay, locale)}.`
        : `Please choose a date on or before ${formatCalendarDay(maxDay, locale)}.`,
    }
  }
  return { day, error: null }
}

export function InquiryForm({ locale, accommodations, mode, preselectedAccommodation }: { locale: SiteLocale; accommodations: Accommodation[]; mode: 'stay' | 'seminar' | 'both'; preselectedAccommodation?: string }) {
  const [kind, setKind] = useState<'stay' | 'seminar'>(mode === 'seminar' ? 'seminar' : 'stay')
  const [selected, setSelected] = useState<string[]>(preselectedAccommodation ? [preselectedAccommodation] : [])
  const [arrivalInput, setArrivalInput] = useState('')
  const [arrival, setArrival] = useState('')
  const [arrivalError, setArrivalError] = useState<string | null>(null)
  const [departureInput, setDepartureInput] = useState('')
  const [departure, setDeparture] = useState('')
  const [departureError, setDepartureError] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('')
  const [availability, setAvailability] = useState<AvailabilityUnit[] | null>(null)
  const [availabilityError, setAvailabilityError] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const arrivalInputRef = useRef<HTMLInputElement>(null)
  const departureInputRef = useRef<HTMLInputElement>(null)
  const today = todayInVienna()
  const tomorrow = addCalendarDays(today, 1)
  const latestDay = addCalendarYears(today, 3)
  const latestArrival = addCalendarDays(latestDay, -2)
  const arrivalMax = kind === 'stay' ? latestArrival : latestDay
  const departureMin = arrival ? addCalendarDays(arrival, 2) : tomorrow
  const departureMax = arrival ? [latestDay, addCalendarDays(arrival, 90)].sort()[0] : latestDay
  const start = arrival || today
  const end = departure && departure >= start ? departure : plusMonths(start, 3)
  const queryFrom = kind === 'seminar' && arrival ? previousDay(arrival) : start
  const hasDates = Boolean(arrival && (kind === 'seminar' || departure))

  useEffect(() => {
    if (!hasDates) return
    const controller = new AbortController()
    const query = new URLSearchParams({ locale, from: queryFrom, through: end })
    fetch(`/api/public-availability?${query}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error('availability'); return response.json() as Promise<AvailabilityResponse> })
      .then((result) => { setAvailability(result.units); setAvailabilityError(false) })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) { setAvailabilityError(true); setAvailability(null) } })
    return () => controller.abort()
  }, [locale, queryFrom, end, hasDates])

  const allowedUnits = useMemo(() => kind === 'seminar' ? accommodations.filter((unit) => unit.seminarCapable) : accommodations, [accommodations, kind])
  const selectedUnits = allowedUnits.filter((unit) => selected.includes(unit.slug))
  const relevantStatuses = selectedUnits.map((unit) => availability?.find((status) => status.accommodationId === unit.id)).filter((status): status is AvailabilityUnit => Boolean(status))
  const unknown = availabilityError || !availability || relevantStatuses.some((status) => status.state !== 'ready')
  const blocked = hasDates && relevantStatuses.some((status) => status.blockedDates.some((day) => kind === 'seminar' ? day >= queryFrom && day <= arrival : day >= arrival && day < departure))

  function applyDepartureInput(input: string, arrivalDay: string): boolean {
    if (!input.trim()) {
      setDeparture('')
      setDepartureError(null)
      return false
    }
    const minDay = addCalendarDays(arrivalDay, 2)
    const maxDay = [latestDay, addCalendarDays(arrivalDay, 90)].sort()[0]
    const result = validateDateInput(input, today, minDay, maxDay, locale)
    setDepartureError(result.error)
    setDeparture(result.day)
    if (result.day) setDepartureInput(formatCalendarDay(result.day, locale))
    return Boolean(result.day)
  }

  function applyArrivalDay(day: string) {
    setAvailability(null)
    setAvailabilityError(false)
    setArrival(day)
    setArrivalError(null)
    setArrivalInput(formatCalendarDay(day, locale))
    setDeparture('')
    if (departureInput.trim()) applyDepartureInput(departureInput, day)
  }

  function commitArrival(maxDay = arrivalMax): boolean {
    const result = validateDateInput(arrivalInput, today, tomorrow, maxDay, locale)
    setArrivalError(result.error)
    if (!result.day) {
      setArrival('')
      setDeparture('')
      return false
    }
    applyArrivalDay(result.day)
    return true
  }

  function commitDeparture(): boolean {
    if (!arrival) {
      setDeparture('')
      setDepartureError(locale === 'de' ? 'Bitte gib zuerst eine gültige Anreise ein.' : 'Please enter a valid arrival date first.')
      return false
    }
    return applyDepartureInput(departureInput, arrival)
  }

  function switchKind(next: 'stay' | 'seminar') {
    setAvailability(null)
    setAvailabilityError(false)
    setKind(next)
    if (next === 'seminar') setSelected((previous) => previous.filter((slug) => accommodations.some((unit) => unit.slug === slug && unit.seminarCapable)).slice(0, 1))
    if (arrival && arrival > (next === 'stay' ? latestArrival : latestDay)) {
      setArrival('')
      setDeparture('')
      setArrivalError(locale === 'de'
        ? `Bitte wähle ein Datum bis ${formatCalendarDay(next === 'stay' ? latestArrival : latestDay, locale)}.`
        : `Please choose a date on or before ${formatCalendarDay(next === 'stay' ? latestArrival : latestDay, locale)}.`)
    } else if (arrival) {
      setArrivalError(null)
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const arrivalResult = validateDateInput(arrivalInput, today, tomorrow, arrivalMax, locale)
    setArrivalError(arrivalResult.error)
    if (!arrivalResult.day) {
      setArrival('')
      setDeparture('')
      arrivalInputRef.current?.focus()
      return
    }

    let submittedDeparture: string | undefined
    if (kind === 'stay') {
      const departureResult = validateDateInput(
        departureInput,
        today,
        addCalendarDays(arrivalResult.day, 2),
        [latestDay, addCalendarDays(arrivalResult.day, 90)].sort()[0],
        locale,
      )
      setDepartureError(departureResult.error)
      if (!departureResult.day) {
        applyArrivalDay(arrivalResult.day)
        departureInputRef.current?.focus()
        return
      }
      submittedDeparture = departureResult.day
      setDeparture(departureResult.day)
      setDepartureInput(formatCalendarDay(departureResult.day, locale))
    }

    setArrival(arrivalResult.day)
    setArrivalInput(formatCalendarDay(arrivalResult.day, locale))
    setSubmitState('sending')
    try {
      const response = await fetch('/api/public-inquiries', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, kind, accommodationSlugs: selected, arrival: arrivalResult.day, departure: submittedDeparture, name, email, phone, guests, message, company }),
      })
      if (!response.ok) throw new Error('submit')
      setSubmitState('success')
    } catch { setSubmitState('error') }
  }

  return <div className="site-inquiry-form">
    <Card className="site-form-card"><CardHeader><CardTitle>{locale === 'de' ? 'Anfrage senden' : 'Send an inquiry'}</CardTitle></CardHeader><CardContent>
      {mode === 'both' && <Tabs value={kind} onValueChange={(value) => switchKind(value as 'stay' | 'seminar')} className="mb-7"><TabsList><TabsTrigger value="stay">{locale === 'de' ? 'Übernachtung' : 'Stay'}</TabsTrigger><TabsTrigger value="seminar">{locale === 'de' ? 'Seminar' : 'Seminar'}</TabsTrigger></TabsList></Tabs>}
      <form onSubmit={submit} className="space-y-6">
        <fieldset><legend className="mb-3 text-sm font-medium">{locale === 'de' ? 'Wohnung wählen' : 'Choose apartment'}</legend><div className="grid gap-3 sm:grid-cols-2">{allowedUnits.map((unit) => <Label key={unit.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"><Checkbox checked={selected.includes(unit.slug)} onCheckedChange={(checked) => setSelected((previous) => checked ? kind === 'seminar' ? [unit.slug] : [...previous, unit.slug] : previous.filter((slug) => slug !== unit.slug))} /><span>{unit.name}</span></Label>)}</div></fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="inquiry-arrival">{kind === 'seminar' ? locale === 'de' ? 'Seminartag' : 'Seminar day' : locale === 'de' ? 'Anreise' : 'Arrival'}</Label>
            <DateInput
              ref={arrivalInputRef}
              id="inquiry-arrival"
              locale={locale}
              value={arrivalInput}
              selectedDay={arrival}
              minDay={tomorrow}
              maxDay={arrivalMax}
              error={arrivalError}
              hint={locale === 'de' ? 'Du kannst auch 2009 oder 200926 eingeben.' : 'You can also enter 2009 or 200926.'}
              onChange={(value) => {
                setAvailability(null)
                setAvailabilityError(false)
                setArrivalInput(value)
                setArrival('')
                setArrivalError(null)
                setDeparture('')
              }}
              onBlur={() => commitArrival()}
              onSelect={applyArrivalDay}
            />
          </div>
          {kind === 'stay' && <div className="space-y-2">
            <Label htmlFor="inquiry-departure">{locale === 'de' ? 'Abreise' : 'Departure'}</Label>
            <DateInput
              ref={departureInputRef}
              id="inquiry-departure"
              locale={locale}
              value={departureInput}
              selectedDay={departure}
              minDay={departureMin}
              maxDay={departureMax}
              error={departureError}
              onChange={(value) => {
                setAvailability(null)
                setAvailabilityError(false)
                setDepartureInput(value)
                setDeparture('')
                setDepartureError(null)
              }}
              onBlur={commitDeparture}
              onSelect={(day) => {
                setAvailability(null)
                setAvailabilityError(false)
                setDeparture(day)
                setDepartureError(null)
                setDepartureInput(formatCalendarDay(day, locale))
              }}
            />
          </div>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="inquiry-name">{locale === 'de' ? 'Name' : 'Name'}</Label><Input id="inquiry-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></div><div className="space-y-2"><Label htmlFor="inquiry-email">E-Mail</Label><Input id="inquiry-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="inquiry-phone">{locale === 'de' ? 'Telefon (optional)' : 'Phone (optional)'}</Label><Input id="inquiry-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="inquiry-guests">{locale === 'de' ? 'Personen' : 'Guests'}</Label><Input id="inquiry-guests" type="number" min={1} max={20} value={guests} onChange={(event) => setGuests(Number(event.target.value))} required /></div></div>
        <div className="space-y-2"><Label htmlFor="inquiry-message">{locale === 'de' ? 'Nachricht (optional)' : 'Message (optional)'}</Label><Textarea id="inquiry-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} /></div>
        <div className="absolute -left-[9999px]" aria-hidden="true"><Label htmlFor="inquiry-company">Company</Label><Input id="inquiry-company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} /></div>
        <p className="text-xs leading-relaxed text-muted-foreground">{locale === 'de' ? 'Das Formular sendet eine unverbindliche Anfrage. Es nimmt keine Buchung vor.' : 'This form sends a non-binding inquiry. It does not make a booking.'}</p>
        <Button type="submit" disabled={submitState === 'sending' || selected.length === 0}>{submitState === 'sending' ? locale === 'de' ? 'Senden …' : 'Sending…' : locale === 'de' ? 'Anfrage senden' : 'Send inquiry'}</Button>
        {submitState === 'success' && <Alert><AlertTitle>{locale === 'de' ? 'Anfrage gesendet' : 'Inquiry sent'}</AlertTitle><AlertDescription>{locale === 'de' ? 'Wir melden uns bei dir. Der Termin ist noch nicht reserviert.' : 'We will get back to you. The date is not reserved yet.'}</AlertDescription></Alert>}
        {submitState === 'error' && <Alert variant="destructive"><AlertTitle>{locale === 'de' ? 'Senden nicht möglich' : 'Could not send'}</AlertTitle><AlertDescription>{locale === 'de' ? 'Bitte versuche es später erneut oder schreibe uns direkt.' : 'Please try again later or contact us directly.'}</AlertDescription></Alert>}
      </form>
    </CardContent></Card>
    <Card className="site-availability-card"><CardHeader><CardTitle>{locale === 'de' ? 'Verfügbarkeit' : 'Availability'}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-relaxed text-muted-foreground">{locale === 'de' ? 'Kalenderdaten können sich verzögern. Ein Termin ist erst nach unserer Zusage fixiert.' : 'Calendar data can be delayed. A date is only confirmed after our reply.'}</p>{selected.length === 0 ? <p className="text-sm">{locale === 'de' ? 'Bitte zuerst eine Wohnung wählen.' : 'Please choose an apartment first.'}</p> : !hasDates ? <p className="text-sm">{locale === 'de' ? 'Bitte einen gültigen Termin wählen.' : 'Please choose valid dates.'}</p> : blocked ? <Badge variant="destructive">{locale === 'de' ? 'Im gewählten Zeitraum liegt eine Sperre' : 'Some selected dates are blocked'}</Badge> : unknown ? <Badge variant="secondary">{locale === 'de' ? 'Verfügbarkeit auf Anfrage' : 'Availability on request'}</Badge> : <Badge variant="secondary">{locale === 'de' ? 'Derzeit keine Sperre bekannt' : 'No current block known'}</Badge>}{hasDates && <p className="text-xs text-muted-foreground">{locale === 'de' ? 'Geprüfter Zeitraum' : 'Checked period'}: {kind === 'seminar' ? formatCalendarDay(arrival, locale) : `${formatCalendarDay(arrival, locale)} – ${formatCalendarDay(departure, locale)}`}</p>}</CardContent></Card>
  </div>
}
