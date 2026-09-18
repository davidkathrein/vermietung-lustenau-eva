'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'

import type { SiteLocale } from '@/lib/locale'
import type { Accommodation, Page } from '@/payload-types'

import { PageBlocks } from './PageBlocks'

export function LivePage({ initialPage, locale, accommodations, serverURL }: { initialPage: Page; locale: SiteLocale; accommodations: Accommodation[]; serverURL: string }) {
  const { data } = useLivePreview<Page>({ initialData: initialPage, serverURL, depth: 2 })
  return <PageBlocks page={data} locale={locale} accommodations={accommodations} />
}
