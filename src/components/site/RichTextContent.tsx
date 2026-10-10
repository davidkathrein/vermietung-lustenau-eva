'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'

export function RichTextContent({ data }: { data: Parameters<typeof RichText>[0]['data'] }) {
  return <RichText data={data} />
}
