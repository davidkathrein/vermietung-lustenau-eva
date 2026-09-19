'use client'

import { CalendarBlankIcon } from '@phosphor-icons/react'
import { forwardRef, useRef, useState } from 'react'
import { de, enGB } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { validCalendarDay } from '@/lib/calendar-day'
import type { SiteLocale } from '@/lib/locale'

function toDate(value: string): Date | undefined {
  if (!validCalendarDay(value)) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function fromDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

type DateInputProps = {
  id: string
  value: string
  selectedDay: string
  minDay: string
  maxDay: string
  locale: SiteLocale
  error: string | null
  hint?: string
  onChange: (value: string) => void
  onBlur: () => void
  onSelect: (value: string) => void
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput({
  id,
  value,
  selectedDay,
  minDay,
  maxDay,
  locale,
  error,
  hint,
  onChange,
  onBlur,
  onSelect,
}, ref) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const ignoreNextBlurRef = useRef(false)
  const selected = toDate(selectedDay)
  const minimum = toDate(minDay)
  const maximum = toDate(maxDay)
  const languageTag = locale === 'de' ? 'de-AT' : 'en-GB'
  const descriptionIds = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

  return <>
    <div ref={inputContainerRef} className="relative">
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          if (ignoreNextBlurRef.current) {
            ignoreNextBlurRef.current = false
            return
          }
          if (event.relatedTarget instanceof Node && inputContainerRef.current?.contains(event.relatedTarget)) {
            if (value.trim()) onBlur()
            return
          }
          onBlur()
        }}
        aria-invalid={Boolean(error)}
        aria-required="true"
        aria-describedby={descriptionIds}
        required
        className="pr-10 tabular-nums"
      />
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          render={<Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            aria-label={locale === 'de' ? 'Kalender öffnen' : 'Open calendar'}
            onPointerDown={() => {
              ignoreNextBlurRef.current = true
              if (value.trim()) onBlur()
            }}
          />}
        >
          <CalendarBlankIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            locale={locale === 'de' ? de : enGB}
            labels={{
              labelGrid: (date) => new Intl.DateTimeFormat(languageTag, { month: 'long', year: 'numeric' }).format(date),
              labelNext: () => locale === 'de' ? 'Nächster Monat' : 'Next month',
              labelPrevious: () => locale === 'de' ? 'Vorheriger Monat' : 'Previous month',
              labelDayButton: (date, modifiers) => {
                const parts = [new Intl.DateTimeFormat(languageTag, {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                }).format(date)]
                if (modifiers.today) parts.push(locale === 'de' ? 'Heute' : 'Today')
                if (modifiers.selected) parts.push(locale === 'de' ? 'Ausgewählt' : 'Selected')
                return parts.join(', ')
              },
            }}
            selected={selected}
            defaultMonth={selected ?? minimum}
            startMonth={minimum}
            endMonth={maximum}
            disabled={minimum && maximum ? [{ before: minimum }, { after: maximum }] : undefined}
            onSelect={(date) => {
              if (!date) return
              onSelect(fromDate(date))
              setCalendarOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
    {hint && <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs leading-relaxed text-destructive">{error}</p>}
  </>
})

DateInput.displayName = 'DateInput'
