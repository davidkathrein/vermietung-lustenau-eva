'use client'

import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export default function CalendarExportField() {
  const { id } = useDocumentInfo()
  const { i18n } = useTranslation()
  const de = i18n.language === 'de'
  const [url, setURL] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    fetch(`/api/admin-calendar-export/${id}`, { credentials: 'same-origin', signal: controller.signal })
      .then(async (response) => { const value = await response.json(); if (!response.ok) throw new Error(value.error || 'Unavailable'); return value.url as string })
      .then(setURL).catch((error) => { if (!controller.signal.aborted) setMessage(String(error.message)) })
    return () => controller.abort()
  }, [id])
  return <div className="field-type"><label className="field-label">{de ? 'Kalenderexport für Plattformen' : 'Calendar export for platforms'}</label><p>{de ? 'Diesen privaten Link bei Airbnb und Booking.com als importierten Kalender eintragen. Nur aktive, bestätigte Sperren werden exportiert. Den Link nicht öffentlich teilen.' : 'Import this private link into Airbnb and Booking.com. Only active, confirmed blocks are exported. Do not share it publicly.'}</p>{url && <div className="flex flex-wrap items-center gap-2"><input className="field-type text" readOnly value={url} aria-label={de ? 'Kalenderexport-URL' : 'Calendar export URL'} /><button type="button" className="btn btn--style-secondary" onClick={() => void navigator.clipboard.writeText(url).then(() => setMessage(de ? 'Link kopiert.' : 'Link copied.'))}>{de ? 'Kopieren' : 'Copy'}</button></div>}{message && <p role="status">{message}</p>}</div>
}
