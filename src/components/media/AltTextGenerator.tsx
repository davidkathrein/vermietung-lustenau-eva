'use client'

import { useDocumentInfo, useForm, useFormModified, useLocale, useTranslation } from '@payloadcms/ui'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import './alt-text-generator.scss'

export default function AltTextGenerator() {
  const { id } = useDocumentInfo()
  const locale = useLocale()
  const { i18n } = useTranslation()
  const { dispatchFields } = useForm()
  const modified = useFormModified()
  const de = i18n.language === 'de'
  const [loading, setLoading] = useState(false)
  const [candidate, setCandidate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const currentLocale = locale.code === 'en' ? 'en' : 'de'

  async function generate() {
    if (!id || loading || modified) return
    setLoading(true)
    setCandidate('')
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/admin-alt-text', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id), targetLocale: currentLocale }),
      })
      const result = await response.json() as { alt?: string; error?: string }
      if (!response.ok || typeof result.alt !== 'string') throw new Error(result.error || 'Alt text generation failed')
      setCandidate(result.alt)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Alt text generation failed') }
    finally { setLoading(false) }
  }

  function apply() {
    if (!candidate) return
    dispatchFields({ type: 'UPDATE', path: 'alt', value: candidate })
    setCandidate('')
    setMessage(de ? 'KI-Vorschlag übernommen. Bitte das Medium speichern.' : 'AI suggestion applied. Save the media item to keep it.')
  }

  return <section className="alt-text-generator" aria-label={de ? 'Alternativtext mit KI' : 'AI alt text'}>
    <div className="alt-text-generator__heading">
      <div><strong>{de ? 'Alternativtext mit KI erstellen' : 'Generate alt text with AI'}</strong><p>{de ? 'Erstellt einen Vorschlag aus der verkleinerten Bildversion. Der vorhandene Text wird nicht automatisch überschrieben.' : 'Creates a suggestion from the reduced image. Existing text is never overwritten automatically.'}</p></div>
      <Button type="button" onClick={() => void generate()} disabled={!id || loading || modified}>{loading ? (de ? 'Analysiere …' : 'Analysing…') : (de ? 'Vorschlag erstellen' : 'Generate suggestion')}</Button>
    </div>
    {!id && <p>{de ? 'Speichere das Medium zuerst, damit eine verkleinerte Bildversion erzeugt wird.' : 'Save the media item first so a reduced image can be generated.'}</p>}
    {modified && id && <p>{de ? 'Speichere zuerst die aktuellen Änderungen.' : 'Save the current changes first.'}</p>}
    {candidate && <div className="alt-text-generator__candidate"><strong>{de ? 'KI-Vorschlag' : 'AI suggestion'}</strong><p>{candidate}</p><div><Button type="button" onClick={apply}>{de ? 'Vorschlag übernehmen' : 'Apply suggestion'}</Button><Button type="button" variant="outline" onClick={() => setCandidate('')}>{de ? 'Verwerfen' : 'Discard'}</Button></div></div>}
    {message && <p role="status" className="alt-text-generator__success">{message}</p>}
    {error && <p role="alert" className="alt-text-generator__error">{error}</p>}
  </section>
}
