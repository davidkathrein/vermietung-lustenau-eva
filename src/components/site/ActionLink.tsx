import { ArrowUpRightIcon } from '@phosphor-icons/react'

import { ButtonLink } from '@/components/ui/button'
import { hrefForLink, type LinkValue } from '@/lib/href'
import type { SiteLocale } from '@/lib/locale'

export function ActionLink({ value, locale, variant = 'default' }: { value: LinkValue; locale: SiteLocale; variant?: 'default' | 'outline' }) {
  const href = hrefForLink(value, locale)
  if (!href || !value?.label) return null
  return <ButtonLink href={href} variant={variant} size="lg" className="site-action" target={value.newTab ? '_blank' : undefined} rel={value.newTab ? 'noopener noreferrer' : undefined}>{value.label}<ArrowUpRightIcon aria-hidden="true" /></ButtonLink>
}
