# Hausvermietung Lustenau

Eigenständiges Payload-Projekt für drei Kurzzeitwohnungen in Lustenau. Das öffentliche Frontend ist bewusst nur ein Platzhalter; es wird separat gestaltet und umgesetzt.

## Lokal starten

```bash
pnpm install
cp .env.example .env
# PAYLOAD_SECRET in .env durch einen langen, zufälligen Wert ersetzen
pnpm seed:local
pnpm dev
```

Payload läuft unter `http://localhost:3000/admin`. Beim ersten Aufruf den ersten Admin-Benutzer anlegen. Die lokale SQLite-Datei und `.env` sind nicht im Git-Repository.

`pnpm seed:local` legt drei **lokale Beispieldatensätze** und die bekannten Adressdaten an, falls sie fehlen. Die Namen sind Platzhalter. Wohnung 1 ist vorläufig als die seminarfähige Wohnung markiert. Der Seed überschreibt vorhandene Wohnungen nicht.

## Daten in Payload

Die Sprache der Admin-Oberfläche und die Inhaltssprache sind getrennt. Die Admin-Oberfläche unterstützt Deutsch und Englisch; ihre Sprache wird in den Benutzer-Einstellungen gewählt. Der Schalter „Locale“ oben im Admin wechselt nur die Sprache der bearbeiteten Website-Texte. Er übersetzt nicht die Admin-Bedienelemente.

In Wohnungen, Medien und Website-Einstellungen gibt es zusätzlich direkt im Bearbeitungsformular die Inhaltstabs **Deutsch** und **English**. Ungespeicherte Änderungen sperren den Sprachwechsel, bis sie gespeichert sind. Der Button im anderen Sprachtab übersetzt alle gespeicherten, ausgefüllten Textfelder der Quellsprache (bei Wohnungen auch Bildunterschriften; bei Medien den Alternativtext). Die Übersetzung erscheint als Änderung im aktuellen Formular: prüfen und dann **Speichern**. Bestehende Zieltexte werden nur nach Bestätigung ersetzt. Anfragen und manuelle Sperren sind Verwaltungsdaten und haben keine übersetzten Website-Texte.

Für die KI-Übersetzung muss `OPENROUTER_API_KEY` als **serverseitige** Umgebungsvariable gesetzt sein, lokal in `.env.local` oder `.env`, im Hosting in den Projektvariablen. Standardmäßig wird das kostenlose Modell `deepseek/deepseek-v4-flash-0731:free` verwendet. Antwortet OpenRouter mit HTTP 429 (Ratenlimit), wird die Anfrage einmal mit dem kostenpflichtigen Modell `deepseek/deepseek-v4-flash-0731` wiederholt. Der optionale Wert `OPENROUTER_MODEL` ersetzt das Standardmodell für den ersten Versuch. Der Schlüssel wird nicht an den Browser ausgeliefert. Ohne Schlüssel bleibt die manuelle Bearbeitung beider Sprachen möglich; die Übersetzungsaktion meldet die fehlende Konfiguration. Die neuen Migrationen übernehmen vorhandene Medien-Alternativtexte und das Land in die deutsche Sprachfassung.

- **Wohnungen:** DE/EN-Titel und Texte, Personenzahl, Betten, Fotos, Grundriss und private iCal-Links je Plattform. Jede der drei physischen Wohnungen hat genau einen Datensatz. Der Seminarraum ist eine alternative Nutzung von Wohnung 1 und kein vierter Raum.
- **Website-Einstellungen:** DE/EN-Kopftexte, Adresse, Betreiber und später Kontaktdaten.
- **Anfragen:** Übernachtung für eine bis drei Wohnungen oder ganztägiges Seminar für die seminarfähige Wohnung. Diese Datensätze sind nur im Admin lesbar.
- **Manuelle Sperren:** Starttag inklusive, Endtag exklusiv. Sie erscheinen im Website-Kalender. Sie übertragen sich nicht automatisch zu Airbnb oder Booking.com.
- **Medien:** Fotos und Grundrisse mit Pflichtfeld für Alternativtext.

Neue Wohnungen sind standardmäßig unveröffentlicht. Die Beispieldaten sind lokal veröffentlicht, damit die API für die Frontendentwicklung Antworten liefert.

## Schnittstellen für das Frontend

Das Frontend kann im selben Next.js-Projekt unter `src/app/(frontend)/` entstehen. Öffentliche Inhalte liefert Payload bereits unter `GET /api/accommodations?locale=de&sort=sortOrder` und `GET /api/globals/site-settings?locale=en`. Nicht veröffentlichte Wohnungen und private iCal-Links sind in der öffentlichen REST-Antwort nicht enthalten.

`GET /api/public-availability?locale=de&from=2026-10-01&through=2026-10-31` liefert je Wohnung einen Status und belegte Datumswerte:

```json
{
  "from": "2026-10-01",
  "through": "2026-10-31",
  "units": [
    {
      "id": 1,
      "slug": "wohnung-1",
      "name": "Wohnung 1",
      "sleeps": 4,
      "seminarCapable": true,
      "accommodationId": 1,
      "state": "not-connected",
      "blockedDates": []
    }
  ]
}
```

Nur bei `state: "ready"` darf das Frontend nicht aufgeführte Tage als frei anzeigen. `not-connected` und `error` bedeuten **unbekannte Verfügbarkeit**, auch wenn `blockedDates` leer ist. Manuelle Sperren stehen immer in `blockedDates`; die übrigen Tage bleiben bei fehlenden oder fehlerhaften Feeds unbekannt. Die iCal-Links werden nur auf dem Server abgerufen. Der Abruf prüft die Hostnamen auf Airbnb oder Booking.com und begrenzt Laufzeit und Dateigröße.

`POST /api/public-inquiries` akzeptiert JSON mit `kind` (`stay` oder `seminar`), `accommodationSlugs`, `arrival`, bei Übernachtung `departure`, `name`, `email`, `guests` sowie optional `phone` und `message`. Das optionale Feld `company` ist ein unsichtbares Spam-Feld. Beispiel:

```json
{
  "kind": "stay",
  "accommodationSlugs": ["wohnung-1", "wohnung-2"],
  "arrival": "2026-10-05",
  "departure": "2026-10-07",
  "name": "Beispielperson",
  "email": "beispiel@example.invalid",
  "guests": 6
}
```

Für Übernachtungen gelten mindestens zwei Nächte. Eine Seminaranfrage betrifft genau die seminarfähige Wohnung. Die API speichert Anfragen; sie **reserviert keine Zeiten**. In Produktion antwortet der Endpunkt mit 503, bis `ENABLE_PUBLIC_INQUIRIES=true` ausdrücklich gesetzt ist.

## Vor Veröffentlichung

Die Airbnb- und Booking.com-Inserate müssen angelegt und ihre iCal-Links je Wohnung in Payload eingetragen werden. Der beidseitige Plattformabgleich und manuelle Sperren müssen mit echten Inseraten getestet werden. iCal hat eine Verzögerung; die Website nimmt daher nur Anfragen an. Nach einer Zusage müssen die betroffenen Nächte auf beiden Plattformen manuell gesperrt werden.

## Vercel-Vorschau mit Neon und Blob

Lokal bleibt SQLite als Datei aktiv. `vercel env pull .env.local --environment=development` lädt die lokale Konfiguration; `DATABASE_URL` zeigt dabei auf die lokale SQLite-Datei. In Vercel zeigt `DATABASE_URL` für **Preview** auf einen eigenen Neon-Branch und für **Production** auf den Neon-Branch `production` in Frankfurt. `PAYLOAD_SECRET` ist für alle drei Vercel-Umgebungen separat gesetzt. Zugangsdaten gehören nicht ins Git-Repository. Payload wählt bei einer Postgres-URL den Postgres-Adapter, sonst SQLite. Die separaten initialen Migrationen liegen unter `src/postgres-migrations/` und `src/migrations/`. Vercels Build Command führt vor `pnpm build` automatisch `pnpm payload migrate` aus. Der lokale Beispieldaten-Seed wird nicht automatisch nach Neon kopiert. Die Integrationstests nutzen eine eigene lokale SQLite-Datei; eine zusätzliche Neon-Testdatenbank ist derzeit nicht nötig.

Vercel Blob ist für die Medien-Collection vorbereitet. Der öffentliche Blob Store `hausvermietung-lustenau-media` in Frankfurt ist mit Preview und Production verbunden; sein `BLOB_READ_WRITE_TOKEN` ist dort als geheime Umgebungsvariable hinterlegt. Ohne den Token verwendet die lokale Entwicklung weiterhin das Dateisystem. Das Plugin verwendet direkte Browser-Uploads, damit größere Bilder nicht am Upload-Limit einer Vercel Function scheitern.

Außerdem fehlen echte Fotos, Grundrisse, Preise, Kontakt-E-Mail, Datenschutztext, E-Mail-Benachrichtigung für neue Anfragen und ein dauerhafter Schutz gegen Formularspam. Für den Livebetrieb sind eine dauerhafte Datenbank und Medienspeicherung festzulegen. Diese Punkte sind keine Voraussetzungen für die lokale Frontendentwicklung, aber für eine Veröffentlichung.
