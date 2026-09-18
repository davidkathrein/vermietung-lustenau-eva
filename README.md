# Wohnen in Lustenau

Zweisprachige Website (Deutsch und Englisch) mit Payload CMS, Next.js und einem gemeinsamen Kalender für drei Wohnungen. Wohnung 1 ist alternativ als Seminarraum nutzbar. Die Seite verwendet das bestehende Theme und Shadcn-Komponenten. Der Seed nutzt für die unveröffentlichte Vorschau vier generierte Konzeptfotos; sie zeigen nicht die echten Wohnungen.

## Lokal starten

```bash
pnpm install
cp .env.example .env
# PAYLOAD_SECRET in .env setzen
pnpm payload migrate
pnpm seed:content
pnpm dev
```

`/` leitet permanent auf `/de` weiter. Die zweite Sprache liegt unter `/en`. Das CMS ist unter `/admin` erreichbar. Der Seed legt drei Wohnungen, `homepage`, Wohnungs- und Kontaktseite mit DE/EN-Inhalten sowie Medien für die Vorschau an und veröffentlicht sie erst nach Befüllung beider Sprachen. Vorhandene redaktionell bearbeitete Datensätze bleiben unangetastet. Die SQLite- und PostgreSQL-Migrationen liegen getrennt unter `src/migrations/` und `src/postgres-migrations/`. Automatisches Schema-Pushing ist deaktiviert. Der nächste Vercel-Build führt Migration, idempotenten Content-Seed und Build in dieser Reihenfolge aus; Produktionsdaten werden nicht allein durch lokale Änderungen befüllt.

## Redaktion

- Seiten bestehen aus Hero-, Fließtext-, Text/Bild-, CTA-, FAQ-, Wohnungsübersicht- und Anfrage-Blöcken. Die Bilder unter `public/admin/block-previews/` erscheinen nur im Admin als Blockvorschau. Die Wohnungsübersicht lädt veröffentlichte Wohnungen automatisch.
- Seiten und Wohnungen haben Entwürfe, Autosave und sprachspezifische Slugs. Das Seitenformular bietet eine eingebettete Live-Vorschau. Eine Veröffentlichung erfordert beide vollständig ausgefüllten Sprachen einschließlich aller Pflicht-Metadaten. Alte öffentliche Slugs erhalten automatische permanente Weiterleitungen.
- Der Sprachwechsel im Bearbeitungsformular ist unabhängig von der Sprache der Admin-Oberfläche. Die KI-Übersetzung wird erst bei vollständiger Quellsprache angeboten. Sie liefert Vorschläge für Texte, Rich-Text-Formatierung und Slugs; jedes Feld kann einzeln oder über „Alles übernehmen“ ins Formular übernommen werden. Speichern und Veröffentlichen bleiben getrennte, manuelle Schritte. `OPENROUTER_API_KEY` ist nur serverseitig nötig.
- Medien haben sprachspezifischen Alternativtext und eine optionale sprachspezifische Caption. Eine gepflegte Caption erscheint immer als Overlay im Bild. Galerien haben keine zweite Caption-Quelle.
- Instagram-Beiträge haben ein eigenes Datenmodell für externe ID, Permalink, Text, Bild und Veröffentlichungsdatum. Ein Scraper oder öffentlicher Feed ist noch nicht angebunden.
- Interne Links speichern direkte Beziehungen zu Seiten oder Wohnungen; zusätzlich sind Web-, Mail-, Telefon- und Ankerlinks möglich. Die Hauptnavigation wird in Website-Einstellungen gepflegt, der Footer listet alle veröffentlichten Wohnungen automatisch.

## Anfragen und Kalender

Anfragen sind unverbindlich und reservieren nichts. Ein bestätigter Aufenthalt oder Seminartag erzeugt eine aktive Sperre im gemeinsamen Wohnungskalender. Eine Stornierung deaktiviert die Sperre, löscht sie aber nicht. Bekannte Konflikte blockieren eine Zusage; bei fehlender oder ausgefallener Plattform-Verbindung ist dafür eine ausdrücklich gesetzte Admin-Ausnahme nötig. Ein Seminar kollidiert auch mit einem Aufenthalt, der am Seminartag an- oder abreist.

Der öffentliche Verfügbarkeitsstatus kombiniert manuelle Sperren mit Airbnb- und Booking.com-iCal-Feeds. Er behauptet bei fehlenden/fehlerhaften Feeds keine freie Verfügbarkeit. `GET /api/public-availability?locale=de&from=2026-10-01&through=2026-10-31` liefert belegte Tage und je Wohnung `ready`, `not-connected` oder `error`. Die Feed-URLs bleiben privat. `POST /api/public-inquiries` ist erst mit `ENABLE_PUBLIC_INQUIRIES=true` freigeschaltet.

Aktive Sperren werden über einen signierten iCal-Link exportiert, damit Airbnb und Booking.com sie importieren können. Den Link zeigt das jeweilige Wohnungsformular nach Konfiguration von `ICAL_EXPORT_SECRET` an. Er enthält keine Gästedaten und kann durch Wechsel des Secrets ungültig gemacht werden. iCal-Synchronisierung ist verzögert und ersetzt keine manuelle Kontrolle vor einer Zusage.

Ein GitHub-Actions-Workflow prüft verbundene Feeds ungefähr alle 30 Minuten über `/api/internal/calendar-check`. Dafür braucht die Website `ICAL_MONITOR_TOKEN` und GitHub die Secrets `CALENDAR_CHECK_TOKEN` (gleicher Wert) und `CALENDAR_CHECK_URL` (vollständige API-URL). Nach drei aufeinanderfolgenden Fehlern geht einmalig eine Warnung an `SUPPORT_EMAIL` und die Kontakt-E-Mail aus Website-Einstellungen; bei Erholung eine Entwarnung. `RESEND_API_KEY` und `EMAIL_FROM` aktivieren den Versand. Solange Resend nicht eingerichtet ist, werden keine E-Mails gesendet. Geplante GitHub-Actions-Läufe sind best effort, nicht sekundengenau.

## Vor öffentlicher Freigabe

Die generierten Konzeptfotos unter `public/seed-media/` müssen vor der Freigabe durch echte Wohnungsfotos ersetzt werden. Auch Grundrisse, Kontakt-E-Mail und -Telefon, Plattform-iCal-Links sowie die Resend-Domain müssen ergänzt und mit echten Inseraten geprüft werden. Anfragen bleiben bis zur bewussten Freischaltung deaktiviert. Die Beschreibungstexte sind ebenfalls redaktionell zu prüfen.

## Prüfungen

```bash
pnpm tsc --noEmit
pnpm test:int
pnpm build
pnpm lint
```
