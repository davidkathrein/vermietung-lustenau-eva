import type { Locale } from './public-site'

export const paths = {
  de: {
    home: '/',
    apartments: '/wohnungen',
    seminar: '/seminar',
    contact: '/kontakt',
    imprint: '/impressum',
    privacy: '/datenschutz',
  },
  en: {
    home: '/en',
    apartments: '/en/apartments',
    seminar: '/en/seminar',
    contact: '/en/contact',
    imprint: '/en/imprint',
    privacy: '/en/privacy',
  },
} as const

export const copy = {
  de: {
    apartments: 'Wohnungen',
    seminar: 'Seminarraum',
    contact: 'Kontakt',
    inquire: 'Aufenthalt anfragen',
    explore: 'Wohnungen entdecken',
    available: 'Verfügbarkeit ansehen',
    select: 'Wohnung auswählen',
    eyebrow: 'Drei Wohnungen · Ein besonderer Ort',
    hero: 'Ankommen. Bleiben. Durchatmen.',
    intro:
      'Drei Wohnungen in Lustenau für kurze Auszeiten, gemeinsame Tage und längere Aufenthalte.',
    homeHeading: 'Raum für Ihre Zeit in Lustenau',
    homeText:
      'Wählen Sie eine Wohnung, zwei Wohnungen oder das ganze Haus. Wir prüfen jede Anfrage persönlich.',
    apartmentHeading: 'Die drei Wohnungen',
    apartmentIntro:
      'Jede Wohnung ist ein eigenes Angebot. Für Gruppen können Sie mehrere Wohnungen gemeinsam anfragen.',
    wholeHouse: 'Das ganze Haus',
    wholeHouseText:
      'Alle drei Wohnungen gemeinsam bieten Platz für bis zu elf Personen. Fragen Sie den Zeitraum direkt bei uns an.',
    seminarHeading: 'Ein Raum für Ihre Ideen',
    seminarIntro:
      'Wohnung 1 kann alternativ als Seminarraum für einen ganzen Tag und bis zu zehn Personen genutzt werden. Eine Übernachtung im selben Raum ist an diesem Tag nur nach Prüfung der Zeitfenster möglich.',
    location: 'Lage & Anreise',
    locationText:
      'In Lustenau, im Herzen des Rheintals. Die genauen Hinweise zur Anreise erhalten Sie mit Ihrer Buchungsbestätigung.',
    detail: 'Wohnung im Detail',
    people: 'Personen',
    kitchen: 'Kleine Küche',
    photosPending: 'Echte Fotos folgen',
    planPending: 'Grundriss folgt',
    pricePending: 'Preis folgt',
    inquiryHeading: 'Unverbindlich anfragen',
    inquiryText:
      'Ihre Anfrage ist noch keine Reservierung. Wir prüfen die Kalender und melden uns persönlich.',
    contactHeading: 'Schreiben Sie uns',
    contactIntro:
      'Für Fragen zu einer Wohnung, dem ganzen Haus oder einem Seminar erreichen Sie uns hier. Für einen konkreten Aufenthalt nutzen Sie bitte das Anfrageformular.',
    legalPending: 'Die verbindlichen Angaben werden vor der Veröffentlichung ergänzt.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    language: 'Sprache',
  },
  en: {
    apartments: 'Apartments',
    seminar: 'Seminar room',
    contact: 'Contact',
    inquire: 'Request a stay',
    explore: 'Explore apartments',
    available: 'View availability',
    select: 'Choose an apartment',
    eyebrow: 'Three apartments · One special place',
    hero: 'Arrive. Stay. Breathe.',
    intro: 'Three apartments in Lustenau for short breaks, shared days and longer stays.',
    homeHeading: 'Make time for Lustenau',
    homeText:
      'Choose one apartment, two apartments or the entire house. We review every request personally.',
    apartmentHeading: 'The three apartments',
    apartmentIntro:
      'Each apartment is a separate offer. Groups can request several apartments together.',
    wholeHouse: 'The entire house',
    wholeHouseText:
      'Together, the three apartments sleep up to eleven guests. Ask us about your dates.',
    seminarHeading: 'Space for your ideas',
    seminarIntro:
      'Apartment 1 can alternatively be used as a full-day seminar room for up to ten people. Overnight stays in the same room on that day depend on the changeover times.',
    location: 'Location & arrival',
    locationText:
      'In Lustenau, in the heart of the Rhine valley. You will receive detailed arrival instructions with your booking confirmation.',
    detail: 'Apartment details',
    people: 'guests',
    kitchen: 'Small kitchen',
    photosPending: 'Property photos to follow',
    planPending: 'Floor plan to follow',
    pricePending: 'Price to follow',
    inquiryHeading: 'Send an inquiry',
    inquiryText: 'An inquiry is not a reservation. We check the calendars and reply personally.',
    contactHeading: 'Get in touch',
    contactIntro:
      'For questions about an apartment, the entire house or a seminar, contact us here. For specific dates, please use the inquiry form.',
    legalPending: 'The required details will be added before publication.',
    imprint: 'Imprint',
    privacy: 'Privacy',
    language: 'Language',
  },
} as const

export function apartmentHref(locale: Locale, slug: string) {
  return `${paths[locale].apartments}/${slug}`
}
