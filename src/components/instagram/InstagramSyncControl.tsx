'use client'

import { useEffect, useState } from 'react'
import { Gutter, useTranslation } from '@payloadcms/ui'

import { Button } from '@/components/ui/button'

type SyncStatus = { snapshotId?: string | null; startedAt?: string | null; completedAt?: string | null; lastError?: string | null; lastImportedCount?: number | null }

export default function InstagramSyncControl() {
  const { i18n } = useTranslation()
  const de = i18n.language === 'de'
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [status, setStatus] = useState<SyncStatus>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const response = await fetch('/api/admin-instagram-sync', { credentials: 'same-origin' })
    if (!response.ok) throw new Error('Status konnte nicht geladen werden.')
    const data = await response.json() as { configured: boolean; status: SyncStatus }
    setConfigured(data.configured)
    setStatus(data.status)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin-instagram-sync', { credentials: 'same-origin', signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error('Status unavailable'); return response.json() as Promise<{ configured: boolean; status: SyncStatus }> })
      .then((data) => { if (!controller.signal.aborted) { setConfigured(data.configured); setStatus(data.status) } })
      .catch(() => { if (!controller.signal.aborted) setMessage(de ? 'Status konnte nicht geladen werden.' : 'Could not load sync status.') })
    return () => controller.abort()
  }, [de])

  async function run() {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin-instagram-sync', { method: 'POST', credentials: 'same-origin' })
      const result = await response.json() as { state?: string; imported?: number; error?: string }
      if (!response.ok) throw new Error(result.error || 'Abgleich fehlgeschlagen.')
      setMessage(result.state === 'started' ? (de ? 'Abruf gestartet. Der stündliche Lauf übernimmt die Ergebnisse, sobald Bright Data fertig ist.' : 'Collection started. The hourly run will import the results when Bright Data finishes.')
        : result.state === 'running' ? (de ? 'Bright Data arbeitet noch. Bitte später erneut prüfen.' : 'Bright Data is still running. Check again later.')
          : result.state === 'imported' ? (de ? `${result.imported ?? 0} neue Beiträge importiert.` : `${result.imported ?? 0} new posts imported.`) : (de ? 'Der Abruf ist fehlgeschlagen. Bitte erneut versuchen.' : 'Collection failed. Please try again.'))
      await refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Abgleich fehlgeschlagen.') }
    finally { setBusy(false) }
  }

  return <Gutter className="instagram-sync-control">
    <section className="instagram-sync-control__content" aria-label={de ? 'Instagram-Abgleich' : 'Instagram sync'}>
      <Button className="btn btn--style-primary instagram-sync-control__button" type="button" onClick={() => void run()} disabled={busy || !configured}>{busy ? (de ? 'Prüfe …' : 'Checking…') : status.snapshotId ? (de ? 'Abruf jetzt prüfen' : 'Check collection now') : (de ? 'Instagram jetzt abrufen' : 'Collect Instagram now')}</Button>
      <div className="instagram-sync-control__status" aria-live="polite">
        {configured === false && <p>{de ? 'BRIGHTDATA_API_KEY und INSTAGRAM_PROFILE_URL müssen in der Serverumgebung gesetzt sein.' : 'Set BRIGHTDATA_API_KEY and INSTAGRAM_PROFILE_URL in the server environment.'}</p>}
        {status.startedAt && <p>{de ? 'Letzter Start' : 'Last started'}: {new Date(status.startedAt).toLocaleString(de ? 'de-AT' : 'en-GB')}</p>}
        {status.completedAt && <p>{de ? 'Letzter Import' : 'Last import'}: {new Date(status.completedAt).toLocaleString(de ? 'de-AT' : 'en-GB')} ({status.lastImportedCount ?? 0} {de ? 'neue Beiträge' : 'new posts'})</p>}
        {status.lastError && <p role="alert">{status.lastError}</p>}
        {message && <p role="status">{message}</p>}
      </div>
    </section>
  </Gutter>
}
