'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { locale } = useParams<{ locale?: string }>()
  const isGerman = locale !== 'en'

  useEffect(() => {
    console.error(error)
  }, [error])

  return <main id="main-content" className="site-state site-container">
    <p className="site-eyebrow">{isGerman ? 'Unerwarteter Fehler' : 'Unexpected error'}</p>
    <h1>{isGerman ? 'Das hat leider nicht geklappt.' : 'Something went wrong.'}</h1>
    <p>{isGerman ? 'Bitte versuche es noch einmal. Falls der Fehler bleibt, kehre zur Startseite zurück.' : 'Please try again. If the problem persists, return to the homepage.'}</p>
    <Button type="button" size="lg" onClick={retry}>{isGerman ? 'Erneut versuchen' : 'Try again'}</Button>
  </main>
}
