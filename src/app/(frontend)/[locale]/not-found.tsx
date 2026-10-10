import { ButtonLink } from '@/components/ui/button'

export default function NotFound() {
  return <main id="main-content" className="site-state site-container">
    <p className="site-eyebrow">404</p>
    <h1>Diese Seite ist nicht da. <span lang="en">This page is not here.</span></h1>
    <p>Vielleicht wurde sie verschoben oder die Adresse stimmt nicht mehr. <span lang="en">It may have moved, or the address may no longer be correct.</span></p>
    <div className="flex flex-wrap gap-3">
      <ButtonLink href="/de" size="lg">Zur deutschen Startseite</ButtonLink>
      <ButtonLink href="/en" size="lg" variant="outline"><span lang="en">English homepage</span></ButtonLink>
    </div>
  </main>
}
