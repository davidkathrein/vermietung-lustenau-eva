# Website-Inhalte

Dieses Modell beschreibt die redaktionell gepflegten Inhalte der Vermietungswebsite für drei Wohnungen in Lustenau.

## Sprache

**Seite**:
Eine redaktionell gepflegte Website-Seite, deren Inhalt aus geordneten Inhaltsblöcken besteht.
_Avoid_: Statische Unterseite

**Homepage**:
Die Seite mit dem Namen `homepage`, die am Einstieg der Website erscheint.
_Avoid_: Separater Startseiteninhalt in den Website-Einstellungen

**Inhaltsblock**:
Ein inhaltlicher Abschnitt einer Seite, den die Redaktion in einer Reihenfolge mit anderen Abschnitten kombiniert.
_Avoid_: Fest verdrahteter Seitenabschnitt

**Wohnungsübersicht**:
Ein Seitenabschnitt, der die vorhandenen Wohnungen aus deren eigenen Datensätzen zeigt.
_Avoid_: Manuell gepflegte Kopien der Wohnungsdaten auf einer Seite

**Wohnung**:
Eine der drei physischen, zur Übernachtung angebotenen Einheiten. Wohnung 1 kann alternativ als Seminarraum genutzt werden; das ist keine vierte Einheit.
_Avoid_: Zimmer, separater Seminarraum-Datensatz

**Seminarnutzung**:
Die ganztägige alternative Nutzung von Wohnung 1 für ein Seminar. Sie beansprucht dieselbe physische Einheit wie eine Übernachtung.
_Avoid_: Zusatzoption, vierte Einheit

**Anfrage**:
Eine Bitte um Übernachtung oder Seminarnutzung, die noch keine Zusage und keine Reservierung darstellt.
_Avoid_: Buchung, Reservierung

**Zusage**:
Die Annahme einer Anfrage durch die Betreiberin. Erst die Zusage beansprucht die betroffene Wohnung für den vereinbarten Zeitraum.
_Avoid_: Automatische Buchung durch das Anfrageformular

**Website-Einstellungen**:
Seitenübergreifende Angaben der Website, etwa Name, Kontakt und Adresse; sie enthalten keinen Startseiteninhalt.

**Bildunterschrift**:
Ein optionaler, übersetzbarer Text, der zum Medium gehört und bei dessen öffentlicher Anzeige innerhalb des Bildes erscheint.
_Avoid_: Bildunterschrift nur für eine einzelne Galerie-Verwendung
