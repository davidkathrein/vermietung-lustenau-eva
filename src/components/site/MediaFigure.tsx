import type { Media } from '@/payload-types'

export function MediaFigure({ media, className = '' }: { media: Media | number | null | undefined; className?: string }) {
  if (!media || typeof media === 'number' || !media.url) return null
  return (
    <figure className={`relative overflow-hidden rounded-xl bg-muted ${className}`}>
      {/* Uploads may live locally or in Vercel Blob, so use the returned URL directly. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.url} alt={media.alt || ''} className="h-full w-full object-cover" loading="lazy" />
      {media.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-12 text-sm leading-relaxed text-white">{media.caption}</figcaption>}
    </figure>
  )
}
