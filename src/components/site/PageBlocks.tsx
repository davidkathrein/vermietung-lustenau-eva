import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { SiteLocale } from '@/lib/locale'
import type { Accommodation, Page } from '@/payload-types'

import { AccommodationCard } from './AccommodationCard'
import { ActionLink } from './ActionLink'
import { InquiryForm } from './InquiryForm'
import { InstagramFeed } from './InstagramFeed'
import { MediaFigure } from './MediaFigure'
import { RichTextContent } from './RichTextContent'
import { SectionIntro } from './SectionIntro'

type Block = Page['layout'][number]

export function PageBlocks({ page, locale, accommodations }: { page: Page; locale: SiteLocale; accommodations: Accommodation[] }) {
  const firstInquiryIndex = page.layout?.findIndex((block) => block.blockType === 'inquiry')
  return <main id="main-content">{page.layout?.map((block: Block, index) => {
    const key = block.id ?? `${block.blockType}-${index}`

    if (block.blockType === 'hero') return <section key={key} className="site-hero-section">
      <div className={`site-hero site-container ${block.image ? '' : 'site-hero--text-only'}`}>
        <div className="site-hero__copy">
          {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
          <h1>{block.headline}</h1>
          {block.intro && <p className="site-hero__intro">{block.intro}</p>}
          {block.actions && <div className="site-hero__actions">{block.actions.map((action, actionIndex) => <ActionLink key={action.id ?? actionIndex} value={action.link} locale={locale} variant={actionIndex === 0 ? 'default' : 'outline'} />)}</div>}
        </div>
        <MediaFigure media={block.image} className="site-hero__media" eager={index === 0} sizes="(max-width: 1024px) calc(100vw - 3rem), 52vw" />
      </div>
    </section>

    if (block.blockType === 'richText') return <section key={key} className="site-richtext site-section">
      <div className="site-container site-richtext__inner">
        {block.headline && <h2>{block.headline}</h2>}
        <div className="site-prose"><RichTextContent data={block.content} /></div>
      </div>
    </section>

    if (block.blockType === 'content') return <section key={key} className="site-content-section site-section">
      <div className={`site-content site-container ${block.image ? '' : 'site-content--text-only'} ${block.imageSide === 'left' ? 'site-content--image-left' : ''}`}>
        <div className="site-content__copy">
          <SectionIntro block={block} />
          {block.body && <div className="site-prose"><RichTextContent data={block.body} /></div>}
          <div className="site-content__action"><ActionLink value={block.action} locale={locale} variant="outline" /></div>
        </div>
        <MediaFigure media={block.image} className="site-content__media" sizes="(max-width: 760px) calc(100vw - 2rem), 52vw" />
      </div>
    </section>

    if (block.blockType === 'accommodationOverview') return <section key={key} className="site-overview site-section">
      <div className="site-container">
        <SectionIntro block={block} />
        <div className="site-stay-grid">{accommodations.map((unit, unitIndex) => <AccommodationCard key={unit.id} locale={locale} unit={unit} index={unitIndex} />)}</div>
      </div>
    </section>

    if (block.blockType === 'cta') return <section key={key} className="site-cta site-section">
      <div className="site-container site-cta__inner">
        <SectionIntro block={block} />
        <ActionLink value={block.action} locale={locale} />
      </div>
    </section>

    if (block.blockType === 'faq') return <section key={key} className="site-faq site-section">
      <div className="site-container site-faq__inner">
        <SectionIntro block={block} />
        <Accordion className="site-faq__list">{block.items?.map((item, itemIndex) => <AccordionItem key={item.id ?? itemIndex} value={item.id ?? String(itemIndex)} className="site-faq__item">
          <AccordionTrigger className="site-faq__trigger">{item.question}</AccordionTrigger>
          <AccordionContent className="site-faq__answer"><RichTextContent data={item.answer} /></AccordionContent>
        </AccordionItem>)}</Accordion>
      </div>
    </section>

    if (block.blockType === 'instagramFeed') return <InstagramFeed key={key} locale={locale} eyebrow={block.eyebrow} headline={block.headline} intro={block.intro} />

    if (block.blockType === 'inquiry') return <section key={key} id={index === firstInquiryIndex ? 'anfrage' : undefined} className="site-inquiry site-section">
      <div className="site-container">
        <SectionIntro block={block} />
        <InquiryForm locale={locale} accommodations={accommodations} mode={block.mode} preselectedAccommodation={typeof block.accommodation === 'object' ? block.accommodation?.slug : undefined} />
      </div>
    </section>

    return null
  })}</main>
}
