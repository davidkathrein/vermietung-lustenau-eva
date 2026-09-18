import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { hrefForLink, type LinkValue } from '@/lib/href'
import type { SiteLocale } from '@/lib/locale'

export function ActionLink({ value, locale, variant = 'default' }: { value: LinkValue; locale: SiteLocale; variant?: 'default' | 'outline' }) {
  const href = hrefForLink(value, locale)
  if (!href || !value?.label) return null
  const className = buttonVariants({ variant, size: 'lg' })
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return <a href={href} className={className} target={value.newTab ? '_blank' : undefined} rel={value.newTab ? 'noopener noreferrer' : undefined}>{value.label}</a>
  }
  return <Link href={href} className={className}>{value.label}</Link>
}
