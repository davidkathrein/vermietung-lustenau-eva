import type { PublicImage } from '@/lib/media'

export function ResponsiveImage({ image, sizes, eager = false, className }: {
  image: PublicImage
  sizes: string
  eager?: boolean
  className?: string
}) {
  // Uploads may use either local Payload storage or a tenant-specific Vercel Blob host.
  // The generated Payload size still supplies a responsive source without coupling the UI to one host.
  // eslint-disable-next-line @next/next/no-img-element
  return <img
    src={image.src}
    srcSet={image.srcSet}
    sizes={sizes}
    width={image.width}
    height={image.height}
    alt={image.alt}
    className={className}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : undefined}
    decoding="async"
  />
}
