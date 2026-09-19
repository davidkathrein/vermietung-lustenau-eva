'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { useDocumentInfo, useForm, useFormModified, useLocale, useRouteTransition, useTranslation } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { TranslationEntity } from '@/lib/translation-fields'
import type { ReviewCandidate } from '@/lib/translation-review'

import './translation-panel.scss'

type ReviewChoice = 'previous' | 'candidate'

function fieldAt(document: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, document)
}

function fieldName(path: string): string {
  const labels: Record<string, string> = { slug: 'URL-Segment', title: 'Seitentitel', alt: 'Alternativtext', caption: 'Bildunterschrift', metaTitle: 'Meta-Titel', metaDescription: 'Meta-Beschreibung', headline: 'Überschrift', intro: 'Einleitung', question: 'Frage', answer: 'Antwort', content: 'Text', body: 'Text' }
  const parts = path.split('.')
  return `${labels[parts[parts.length - 1]] || parts[parts.length - 1]} · ${path}`
}

function missingFieldName(path: string, isGermanUI: boolean): string {
  const labels: Record<string, [string, string]> = {
    slug: ['URL-Segment', 'URL slug'], title: ['Seitentitel', 'Page title'], metaTitle: ['Meta-Titel', 'Meta title'],
    metaDescription: ['Meta-Beschreibung', 'Meta description'], layout: ['Seiteninhalt', 'Page content'],
    headline: ['Überschrift', 'Heading'], content: ['Text', 'Text'], items: ['FAQ-Einträge', 'FAQ entries'],
    question: ['Frage', 'Question'], answer: ['Antwort', 'Answer'], label: ['Linktext', 'Link label'],
    name: ['Name', 'Name'], teaser: ['Kurzbeschreibung', 'Teaser'], caption: ['Bildunterschrift', 'Caption'],
    alt: ['Alternativtext', 'Alt text'], siteName: ['Websitename', 'Site name'],
  }
  const parts = path.split('.')
  const label = labels[parts[parts.length - 1]]?.[isGermanUI ? 0 : 1] || path
  if (parts[0] === 'layout' && parts.length > 2) {
    const block = `Block ${Number(parts[1]) + 1}`
    const item = parts.indexOf('items')
    const action = parts.indexOf('actions')
    const suffix = item !== -1 && parts[item + 1] !== undefined && parts.length > item + 2
      ? `${isGermanUI ? 'Eintrag' : 'Entry'} ${Number(parts[item + 1]) + 1} · `
      : action !== -1 && parts[action + 1] !== undefined
        ? `Link ${Number(parts[action + 1]) + 1} · ` : ''
    return `${block} · ${suffix}${label}`
  }
  if (parts[0] === 'layout' && parts.length === 2) return `Block ${Number(parts[1]) + 1}`
  if (parts[0] === 'navigation') return `Navigation ${Number(parts[1]) + 1} · ${label}`
  if (parts[0] === 'footer' && parts[1] === 'links') return `Footer · Link ${Number(parts[2]) + 1} · ${label}`
  return label
}

function FieldPreview({ value, kind }: { value: unknown; kind: ReviewCandidate['kind'] }) {
  if (kind === 'richText' && value && typeof value === 'object') {
    return <div className="translation-panel__rich"><RichText data={value as Parameters<typeof RichText>[0]['data']} /></div>
  }
  return <p>{typeof value === 'string' && value.trim() ? value : '—'}</p>
}

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
  const [available, setAvailable] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [candidates, setCandidates] = useState<ReviewCandidate[]>([])
  const [choices, setChoices] = useState<Record<string, ReviewChoice>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const current = locale.code === 'en' ? 'en' : 'de'
  const source = current === 'de' ? 'en' : 'de'
  const canLoad = entity === 'site-settings' || Boolean(id)

  useEffect(() => {
    if (!canLoad) return
    const controller = new AbortController()
    const params = new URLSearchParams({ entity, targetLocale: current })
    if (id != null) params.set('id', String(id))
    fetch(`/api/admin-translate?${params}`, { credentials: 'same-origin', signal: controller.signal })
      .then((response) => response.json())
      .then((result: { available?: boolean; missingFields?: string[] }) => {
        if (controller.signal.aborted) return
        setAvailable(result.available === true)
        setMissingFields(Array.isArray(result.missingFields) ? result.missingFields : [])
      })
      .catch(() => { if (!controller.signal.aborted) { setAvailable(false); setMissingFields([]) } })
    return () => controller.abort()
  }, [canLoad, current, entity, id])

  function switchLocale(next: 'de' | 'en') {
    if (next === current || modified || loading) return
    setError('')
    setMessage('')
    setCandidates([])
    setChoices({})
    setAvailable(false)
    setMissingFields([])
    const params = new URLSearchParams(window.location.search)
    params.set('locale', next)
    startRouteTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  async function translate() {
    if (loading || modified || !canLoad || !available) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin-translate', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id: id === undefined ? undefined : Number(id), targetLocale: current }),
      })
      const result = await response.json() as { error?: string; fields?: ReviewCandidate[] }
      if (!response.ok || !Array.isArray(result.fields)) throw new Error(result.error || 'Translation failed')
      setCandidates(result.fields)
      setChoices({})
      setMessage(isGermanUI ? 'KI-Vorschläge bereit. Wähle pro Feld einen Wert oder übernimm den Rest.' : 'AI suggestions are ready. Choose a value for each field or accept the remaining suggestions.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Translation failed') }
    finally { setLoading(false) }
  }

  function accept(field: ReviewCandidate) {
    const choice = choices[field.path]
    if (!choice) return
    if (choice === 'candidate') {
      dispatchFields({ type: 'UPDATE', path: field.path, value: field.candidate })
      setModified(true)
    }
    setCandidates((currentCandidates) => currentCandidates.filter((candidate) => candidate.path !== field.path))
    setChoices((currentChoices) => {
      const nextChoices = { ...currentChoices }
      delete nextChoices[field.path]
      return nextChoices
    })
    setMessage(choice === 'candidate'
      ? (isGermanUI ? 'KI-Vorschlag ins Formular übernommen.' : 'AI suggestion applied to the form.')
      : (isGermanUI ? 'Bisherigen Wert beibehalten.' : 'Previous value kept.'))
  }

  function acceptAll() {
    for (const field of candidates) dispatchFields({ type: 'UPDATE', path: field.path, value: field.candidate })
    setModified(true)
    setCandidates([])
    setChoices({})
    setMessage(isGermanUI ? 'Restliche KI-Vorschläge übernommen. Bitte prüfen und speichern.' : 'Remaining AI suggestions accepted. Review and save.')
  }

  const sourceLabel = source === 'de' ? 'Deutsch' : 'English'
  return <section className="translation-panel" aria-label={isGermanUI ? 'Inhaltssprache' : 'Content language'}>
    <div className="translation-panel__tabs" role="tablist" aria-label={isGermanUI ? 'Inhaltssprache' : 'Content language'}>
      {(['de', 'en'] as const).map((code) => <Button key={code} type="button" role="tab" aria-selected={code === current} disabled={modified || loading} onClick={() => switchLocale(code)}>{code === 'de' ? 'Deutsch' : 'English'}</Button>)}
    </div>
    <div className="translation-panel__actions">
      {available && <Button type="button" onClick={() => void translate()} disabled={modified || loading || !canLoad}>{loading ? (isGermanUI ? 'Übersetze …' : 'Translating…') : (isGermanUI ? `Mit KI aus ${sourceLabel} übersetzen` : `Translate from ${sourceLabel} with AI`)}</Button>}
      {!modified && canLoad && !available && missingFields.length > 0 ? <div className="translation-panel__missing">
        <p>{isGermanUI ? `Für die Übersetzung fehlen auf ${sourceLabel} noch:` : `Still missing for translation from ${sourceLabel}:`}</p>
        <ul>{missingFields.slice(0, 3).map((path) => <li key={path}>{missingFieldName(path, isGermanUI)}</li>)}</ul>
        {missingFields.length > 3 && <p>{isGermanUI ? `${missingFields.length - 3} weitere` : `${missingFields.length - 3} more`}</p>}
      </div> : <span>{modified ? (isGermanUI ? 'Bitte Änderungen speichern, bevor du die Sprache wechselst oder übersetzt.' : 'Save changes before switching languages or translating.') : !canLoad ? (isGermanUI ? 'Zuerst diesen Eintrag speichern.' : 'Save this item first.') : !available ? (isGermanUI ? `Der Übersetzungsbutton erscheint, sobald alle Pflichtfelder auf ${sourceLabel} gespeichert sind.` : `The translation button appears once all required ${sourceLabel} fields are saved.`) : (isGermanUI ? 'KI-Vorschläge ändern keine Felder ohne deine Bestätigung.' : 'AI suggestions do not change fields without your approval.')}</span>}
    </div>
    {message && <p role="status" className="translation-panel__success">{message}</p>}
    {error && <p role="alert" className="translation-panel__error">{error}</p>}
    {candidates.length > 0 && <div className="translation-panel__review"><div className="translation-panel__review-header"><div><h3>{isGermanUI ? 'Übersetzung prüfen' : 'Review translation'}</h3><p>{isGermanUI ? 'Klicke auf den Wert, den du behalten möchtest.' : 'Select the value you want to keep.'}</p></div><Button type="button" onClick={acceptAll}>{isGermanUI ? 'Rest übernehmen' : 'Accept remaining'}</Button></div>{candidates.map((field) => <article className="translation-panel__field" key={field.path}><h4>{fieldName(field.path)}</h4><div className="translation-panel__comparison"><div className="translation-panel__source"><strong>{isGermanUI ? 'Quelle' : 'Source'}</strong><FieldPreview value={field.source} kind={field.kind} /></div><div className="translation-panel__choice" onClick={() => setChoices((currentChoices) => ({ ...currentChoices, [field.path]: 'previous' }))}><input type="radio" name={`translation-${field.path}`} aria-label={isGermanUI ? 'Vorher' : 'Before'} checked={choices[field.path] === 'previous'} onChange={() => setChoices((currentChoices) => ({ ...currentChoices, [field.path]: 'previous' }))} /><div><strong>{isGermanUI ? 'Vorher' : 'Before'}</strong><FieldPreview value={fieldAt(getData(), field.path)} kind={field.kind} /></div></div><div className="translation-panel__choice" onClick={() => setChoices((currentChoices) => ({ ...currentChoices, [field.path]: 'candidate' }))}><input type="radio" name={`translation-${field.path}`} aria-label={isGermanUI ? 'KI-Vorschlag' : 'AI suggestion'} checked={choices[field.path] === 'candidate'} onChange={() => setChoices((currentChoices) => ({ ...currentChoices, [field.path]: 'candidate' }))} /><div><strong>{isGermanUI ? 'KI-Vorschlag' : 'AI suggestion'}</strong><FieldPreview value={field.candidate} kind={field.kind} /></div></div></div><Button type="button" disabled={!choices[field.path]} onClick={() => accept(field)}>{isGermanUI ? 'Auswahl übernehmen' : 'Apply selection'}</Button></article>)}</div>}
  </section>
}
