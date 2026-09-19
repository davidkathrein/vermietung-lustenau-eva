import type { Block, Field } from 'payload'

import { linkField } from '../fields/link'

const introFields = (): Field[] => [
  { name: 'eyebrow', type: 'text', label: { de: 'Überzeile', en: 'Eyebrow' }, localized: true },
  { name: 'headline', type: 'text', label: { de: 'Überschrift', en: 'Headline' }, localized: true, required: true },
  { name: 'intro', type: 'textarea', label: { de: 'Einleitung', en: 'Introduction' }, localized: true },
]

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: { de: 'Hero', en: 'Hero' }, plural: { de: 'Hero', en: 'Hero' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/hero.webp', alt: 'Vorschau des Seitenkopfs' } } },
  fields: [
    ...introFields(),
    { name: 'image', type: 'upload', relationTo: 'media', label: { de: 'Bild', en: 'Image' } },
    { name: 'actions', type: 'array', label: { de: 'Aktionen', en: 'Actions' }, maxRows: 2, fields: [linkField('link', true)] },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: { de: 'Fließtext', en: 'Rich text' }, plural: { de: 'Fließtext', en: 'Rich text' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/richText.webp', alt: 'Vorschau eines Textabschnitts' } } },
  fields: [
    { name: 'headline', type: 'text', label: { de: 'Überschrift', en: 'Headline' }, localized: true },
    { name: 'content', type: 'richText', label: { de: 'Inhalt', en: 'Content' }, localized: true, required: true },
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: { de: 'Handlungsaufforderung', en: 'Call to action' }, plural: { de: 'Handlungsaufforderungen', en: 'Calls to action' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/cta.webp', alt: 'Vorschau einer Handlungsaufforderung' } } },
  fields: [...introFields(), linkField('action', true)],
}

export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: { de: 'Text und Bild', en: 'Text and image' }, plural: { de: 'Text und Bild', en: 'Text and image' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/content.webp', alt: 'Vorschau eines Text-Bild-Abschnitts' } } },
  fields: [
    ...introFields(),
    { name: 'body', type: 'richText', label: { de: 'Text', en: 'Body' }, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: { de: 'Bild', en: 'Image' } },
    { name: 'imageSide', type: 'select', label: { de: 'Bildposition', en: 'Image position' }, defaultValue: 'right', options: [{ label: { de: 'Rechts', en: 'Right' }, value: 'right' }, { label: { de: 'Links', en: 'Left' }, value: 'left' }] },
    linkField('action'),
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: { de: 'Häufige Fragen', en: 'Frequently asked questions' }, plural: { de: 'Häufige Fragen', en: 'Frequently asked questions' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/faq.webp', alt: 'Vorschau häufig gestellter Fragen' } } },
  fields: [
    ...introFields(),
    {
      name: 'items', type: 'array', label: { de: 'Fragen', en: 'Questions' }, required: true, minRows: 1,
      fields: [
        { name: 'question', type: 'text', label: { de: 'Frage', en: 'Question' }, localized: true, required: true },
        { name: 'answer', type: 'richText', label: { de: 'Antwort', en: 'Answer' }, localized: true, required: true },
      ],
    },
  ],
}

export const AccommodationOverviewBlock: Block = {
  slug: 'accommodationOverview',
  labels: { singular: { de: 'Wohnungsübersicht', en: 'Apartment overview' }, plural: { de: 'Wohnungsübersichten', en: 'Apartment overviews' } },
  admin: { images: { thumbnail: { url: '/admin/block-previews/accommodationOverview.webp', alt: 'Vorschau der Wohnungsübersicht' } } },
  fields: [...introFields()],
}

export const InquiryBlock: Block = {
  slug: 'inquiry',
  labels: { singular: { de: 'Anfrage und Verfügbarkeit', en: 'Inquiry and availability' }, plural: { de: 'Anfragen und Verfügbarkeit', en: 'Inquiries and availability' } },
  fields: [
    ...introFields(),
    {
      name: 'mode', type: 'select', label: { de: 'Anfrageart', en: 'Inquiry type' }, defaultValue: 'both', required: true,
      options: [
        { label: { de: 'Übernachtung und Seminar', en: 'Stay and seminar' }, value: 'both' },
        { label: { de: 'Nur Übernachtung', en: 'Stay only' }, value: 'stay' },
        { label: { de: 'Nur Seminar', en: 'Seminar only' }, value: 'seminar' },
      ],
    },
    { name: 'accommodation', type: 'relationship', relationTo: 'accommodations', label: { de: 'Wohnung vorauswählen', en: 'Preselect apartment' } },
  ],
}

export const pageBlocks = [HeroBlock, RichTextBlock, CTABlock, ContentBlock, FAQBlock, AccommodationOverviewBlock, InquiryBlock]
