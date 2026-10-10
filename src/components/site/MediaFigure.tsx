import { publicImage } from '@/lib/media'
import type { Media } from '@/payload-types'

import { ResponsiveImage } from './ResponsiveImage'

export function MediaFigure({ media, className = '', eager = false, sizes = '100vw' }: { media: Media | number | null | undefined; className?: string; eager?: boolean; sizes?: string }) {
  if (!media || typeof media === 'number' || !media.url) return null
  const image = publicImage(media)
  if (!image) return null

  return (
    <figure className={`site-media ${className}`}>
      <ResponsiveImage image={image} sizes={sizes} eager={eager} />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}
