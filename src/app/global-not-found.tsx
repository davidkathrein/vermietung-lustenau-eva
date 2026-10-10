import type { Metadata } from 'next'

import { ButtonLink } from '@/components/ui/button'

import './(frontend)/styles.css'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden · Wohnen in Lustenau',
  description: 'Die angeforderte Seite wurde nicht gefunden.',
}

export default function GlobalNotFound() {
  return <html lang="de">
    <body>
      <main id="main-content" className="site-state site-container">
        <p className="site-eyebrow">404</p>
        <h1>Seite nicht gefunden</h1>
        <p>Diese Seite ist nicht verfügbar. The requested page is not available.</p>
        <ButtonLink href="/de" size="lg">Zur Startseite</ButtonLink>
      </main>
    </body>
  </html>
}
