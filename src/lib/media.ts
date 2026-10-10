import type { Media } from '@/payload-types'

export type PublicImage = {
  src: string
  srcSet?: string
  width?: number
  height?: number
  alt: string
  preview?: Omit<PublicImage, 'preview'>
}

export function publicImage(media: Media, fallbackAlt = ''): PublicImage | null {
  if (!media.url) return null

  const preview = media.sizes?.ai
  const candidates = [
    preview?.url && preview.width ? `${preview.url} ${preview.width}w` : null,
    media.width ? `${media.url} ${media.width}w` : null,
  ].filter((candidate): candidate is string => Boolean(candidate))

  return {
    src: media.url,
    srcSet: candidates.length > 1 ? candidates.join(', ') : undefined,
    width: media.width || undefined,
    height: media.height || undefined,
    alt: media.decorative ? '' : (media.alt || fallbackAlt),
    preview: preview?.url ? {
      src: preview.url,
      width: preview.width || undefined,
      height: preview.height || undefined,
      alt: media.decorative ? '' : (media.alt || fallbackAlt),
    } : undefined,
  }
}
