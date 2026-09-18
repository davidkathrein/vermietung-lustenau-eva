# Produkt

<!-- impeccable:product-schema 1 -->

## Plattform

web

## Nutzer

Die primäre Gästegruppe ist noch nicht festgelegt. Besucher sollen die drei Wohnungen vergleichen und eine passende Nutzung anfragen können.

## Produktzweck

Die öffentliche Website stellt drei Kurzzeitwohnungen in Lustenau vor. Sie soll ihre Unterschiede verständlich machen und Anfragen für Aufenthalte sowie für die Seminarnutzung der größten Wohnung ermöglichen. Eine Anfrage ist noch keine Buchung oder Reservierung.

## Angebot und Positionierung

Es gibt drei physische Wohnungen. Sie unterscheiden sich in ihrer Größe und sehen jeweils etwas anders aus. Eine Wohnung ist größer als die andere; die dritte ist noch größer und kann alternativ als Konferenz- oder Seminarraum genutzt werden. Diese Nutzung schafft keinen vierten Raum.

Eine darüber hinausgehende Positionierung ist noch offen. Die Website soll keine bestimmte Gästegruppe oder einen besonderen Vorteil behaupten, bevor beides geklärt ist.

## Betrieb und Grenzen

- Das bestehende Payload-Projekt verwaltet Wohnungsdaten und Website-Texte auf Deutsch und Englisch.
- Der öffentliche Anfrage-Endpunkt nimmt Aufenthalts- und Seminaranfragen entgegen. Er reserviert keine Termine.
- Die geplante Verfügbarkeitsanzeige nutzt iCal-Daten von Airbnb und Booking.com sowie manuelle Sperren. Bei fehlenden oder fehlerhaften Feeds ist die Verfügbarkeit unbekannt; solche Tage dürfen nicht als frei dargestellt werden.
- Die aktuellen Wohnungsnamen, Kapazitäten und Beschreibungen stammen aus lokalen Beispieldaten und sind noch keine bestätigten Angaben zum Objekt.

## Vorhandenes Material

- Das öffentliche Frontend ist derzeit eine Platzhalterseite.
- Die Bilder in `concepts/` sind illustrative Entwürfe. Sie zeigen keine echten Wohnungen und dürfen nicht als Unterkunftsfotos verwendet werden.
- Laut Projekt-README fehlen noch echte Fotos, Grundrisse, Preise und Kontaktdaten für eine Veröffentlichung.

## Produktprinzipien

- Jede Wohnung als eigenes Angebot mit ihren tatsächlichen Merkmalen darstellen.
- Die alternative Konferenz- oder Seminarnutzung der größten Wohnung klar erklären.
- Anfragen, bestätigte Buchungen und unbekannte Verfügbarkeit sprachlich und funktional auseinanderhalten.
