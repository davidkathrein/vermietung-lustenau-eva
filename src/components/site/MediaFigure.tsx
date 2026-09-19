import type { Media } from '@/payload-types'

export function MediaFigure({ media, className = '', eager = false }: { media: Media | number | null | undefined; className?: string; eager?: boolean }) {
  if (!media || typeof media === 'number' || !media.url) return null
  return (
    <figure className={`site-media ${className}`}>
      {/* Uploads may live locally or in Vercel Blob, so use the returned URL directly. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.url} alt={media.decorative ? '' : (media.alt || '')} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}
