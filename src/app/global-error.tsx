'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

import './(frontend)/styles.css'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <html lang="de">
    <body>
      <main id="main-content" className="site-state site-container">
        <p className="site-eyebrow">Unerwarteter Fehler · Unexpected error</p>
        <h1>Die Seite ist gerade nicht erreichbar.</h1>
        <p>Bitte versuche es erneut. Please try again in a moment.</p>
        <Button type="button" size="lg" onClick={reset}>Erneut versuchen · Try again</Button>
      </main>
    </body>
  </html>
}
