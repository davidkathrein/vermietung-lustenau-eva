'use client'

import { useDocumentInfo, useForm, useFormModified, useLocale, useRouteTransition, useTranslation } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { translationFields, type TranslationEntity, type TranslationField } from '@/lib/translation-fields'

import './translation-panel.scss'

export default function TranslationPanel() {
  const { collectionSlug, globalSlug, id } = useDocumentInfo()
  const entity = (collectionSlug || globalSlug) as TranslationEntity
  const locale = useLocale()
  const { i18n } = useTranslation()
  const isGermanUI = i18n.language === 'de'
  const modified = useFormModified()
  const { dispatchFields, getData, setModified } = useForm()
  const { startRouteTransition } = useRouteTransition()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const current = locale.code === 'en' ? 'en' : 'de'
  const source = current === 'de' ? 'en' : 'de'

  function switchLocale(next: 'de' | 'en') {
    if (next === current || modified || loading) return
    setError('')
    setMessage('')
    const params = new URLSearchParams(window.location.search)
    params.set('locale', next)
    startRouteTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  async function translate() {
    if (loading || modified || (entity !== 'site-settings' && !id)) return
    if (translationFields(entity, getData() as Record<string, unknown>).length > 0 &&
      !window.confirm(isGermanUI ? 'Vorhandene Texte dieser Sprache durch die Übersetzung ersetzen?' : 'Replace existing text in this language with the translation?')) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin-translate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id: id === undefined ? undefined : Number(id), targetLocale: current }),
      })
      const result = await response.json() as { error?: string; fields?: TranslationField[] }
      if (!response.ok || !Array.isArray(result.fields)) throw new Error(result.error || 'Translation failed')
      for (const field of result.fields) {
        dispatchFields({ type: 'UPDATE', path: field.path, value: field.text })
      }
      setModified(true)
      setMessage(isGermanUI ? 'Übersetzung eingefügt. Bitte prüfen und speichern.' : 'Translation added. Review and save the changes.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  const sourceLabel = source === 'de' ? 'Deutsch' : 'English'
  return <section className="translation-panel" aria-label={isGermanUI ? 'Inhaltssprache' : 'Content language'}>
    <div className="translation-panel__tabs" role="tablist" aria-label={isGermanUI ? 'Inhaltssprache' : 'Content language'}>
      {(['de', 'en'] as const).map((code) => <button
        key={code}
        type="button"
        role="tab"
        aria-selected={code === current}
        disabled={modified || loading}
        onClick={() => switchLocale(code)}
      >{code === 'de' ? 'Deutsch' : 'English'}</button>)}
    </div>
    <div className="translation-panel__actions">
      <button type="button" onClick={() => void translate()} disabled={modified || loading || (entity !== 'site-settings' && !id)}>
        {loading
          ? (isGermanUI ? 'Übersetze …' : 'Translating…')
          : (isGermanUI ? `Mit KI aus ${sourceLabel} übersetzen` : `Translate from ${sourceLabel} with AI`)}
      </button>
      <span>{modified
        ? (isGermanUI ? 'Bitte Änderungen speichern, bevor du die Sprache wechselst oder übersetzt.' : 'Save changes before switching languages or translating.')
        : (!id && entity !== 'site-settings'
          ? (isGermanUI ? 'Zuerst diesen Eintrag speichern.' : 'Save this item first.')
          : (isGermanUI ? 'Übersetzt gespeicherte Texte; das Ergebnis wird erst mit „Speichern“ übernommen.' : 'Translates saved text; the result is only stored when you save.'))}</span>
    </div>
    {message && <p role="status" className="translation-panel__success">{message}</p>}
    {error && <p role="alert" className="translation-panel__error">{error}</p>}
  </section>
}
