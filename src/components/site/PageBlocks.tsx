'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { accommodationPath, type SiteLocale } from '@/lib/locale'
import type { Accommodation, Page } from '@/payload-types'

import { ActionLink } from './ActionLink'
import { MediaFigure } from './MediaFigure'
import { InquiryForm } from './InquiryForm'

type Block = Page['layout'][number]

function SectionIntro({ block }: { block: { eyebrow?: string | null; headline: string; intro?: string | null } }) {
  return <div className="mb-9 max-w-3xl">{block.eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{block.eyebrow}</p>}<h2 className="font-heading text-3xl leading-tight md:text-5xl">{block.headline}</h2>{block.intro && <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{block.intro}</p>}</div>
}

export function PageBlocks({ page, locale, accommodations }: { page: Page; locale: SiteLocale; accommodations: Accommodation[] }) {
  return <main>{page.layout?.map((block: Block, index) => {
    const key = block.id ?? `${block.blockType}-${index}`
    if (block.blockType === 'hero') return <section key={key} className="border-b border-border/60"><div className={`mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 md:py-28 ${block.image ? 'lg:grid-cols-2' : ''}`}><div>{block.eyebrow && <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{block.eyebrow}</p>}<h1 className="max-w-4xl font-heading text-5xl leading-[1.1] tracking-tight md:text-7xl">{block.headline}</h1>{block.intro && <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">{block.intro}</p>}{block.actions && <div className="mt-9 flex flex-wrap gap-3">{block.actions.map((action, actionIndex) => <ActionLink key={action.id ?? actionIndex} value={action.link} locale={locale} variant={actionIndex === 0 ? 'default' : 'outline'} />)}</div>}</div><MediaFigure media={block.image} className="aspect-[4/3]" /></div></section>
    if (block.blockType === 'richText') return <section key={key} className="mx-auto max-w-4xl px-5 py-16 md:py-24">{block.headline && <h2 className="mb-8 font-heading text-3xl md:text-5xl">{block.headline}</h2>}<div className="prose prose-lg max-w-none text-foreground [&_a]:underline [&_p]:mb-5 [&_ul]:my-5"><RichText data={block.content} /></div></section>
    if (block.blockType === 'cta') return <section key={key} className="bg-secondary py-16 md:py-24"><div className="mx-auto max-w-7xl px-5 md:px-8"><SectionIntro block={block} /><ActionLink value={block.action} locale={locale} /></div></section>
    if (block.blockType === 'content') return <section key={key} className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2"><div className={block.imageSide === 'left' ? 'lg:order-2' : ''}><SectionIntro block={block} />{block.body && <div className="prose max-w-none [&_p]:mb-4"><RichText data={block.body} /></div>}<div className="mt-7"><ActionLink value={block.action} locale={locale} variant="outline" /></div></div><MediaFigure media={block.image} className={`aspect-[4/3] ${block.imageSide === 'left' ? 'lg:order-1' : ''}`} /></section>
    if (block.blockType === 'faq') return <section key={key} className="mx-auto max-w-5xl px-5 py-16 md:py-24"><SectionIntro block={block} /><Accordion><div>{block.items?.map((item, itemIndex) => <AccordionItem key={item.id ?? itemIndex} value={item.id ?? String(itemIndex)}><AccordionTrigger>{item.question}</AccordionTrigger><AccordionContent><RichText data={item.answer} /></AccordionContent></AccordionItem>)}</div></Accordion></section>
    if (block.blockType === 'accommodationOverview') return <section key={key} className="bg-card/50 py-16 md:py-24"><div className="mx-auto max-w-7xl px-5 md:px-8"><SectionIntro block={block} /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{accommodations.map((unit, unitIndex) => <Card key={unit.id} className="overflow-hidden bg-background"><div className="px-5 pt-5">{unit.gallery?.[0]?.image ? <MediaFigure media={unit.gallery[0].image} className="aspect-[4/3]" /> : <div className="flex aspect-[4/3] items-end rounded-xl bg-secondary p-6"><span className="font-heading text-6xl text-primary/35">0{unitIndex + 1}</span></div>}</div><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-2xl">{unit.name}</CardTitle><Badge variant="secondary">{unit.sleeps} {locale === 'de' ? 'Personen' : 'guests'}</Badge></div></CardHeader><CardContent><p className="min-h-16 leading-relaxed text-muted-foreground">{unit.teaser}</p><Link href={accommodationPath(locale, unit.slug)} className={buttonVariants({ variant: 'outline' })}>{locale === 'de' ? 'Mehr erfahren' : 'Explore apartment'}</Link></CardContent></Card>)}</div></div></section>
    if (block.blockType === 'inquiry') return <section key={key} className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"><SectionIntro block={block} /><InquiryForm locale={locale} accommodations={accommodations} mode={block.mode} preselectedAccommodation={typeof block.accommodation === 'object' ? block.accommodation?.slug : undefined} /></section>
    return null
  })}</main>
}
