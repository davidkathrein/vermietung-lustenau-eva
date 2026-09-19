'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type MouseEvent } from 'react'

import type { LocalizedRoute, SiteLocale } from '@/lib/locale'

const SCROLL_STORAGE_KEY = 'site-language-switch-scroll'

type StoredScroll = {
  path: string
  progress: number
  y: number
}

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, '') : path
}

function routeForLocale(pathname: string, locale: SiteLocale, targetLocale: SiteLocale, routes: LocalizedRoute[]): string {
  const currentPath = normalizePath(pathname)
  return routes.find((route) => normalizePath(route[locale]) === currentPath)?.[targetLocale] ?? `/${targetLocale}`
}

function storeScroll(path: string) {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
  sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify({ path, progress, y: window.scrollY } satisfies StoredScroll))
}

export function LanguageSwitcher({ locale, routes }: { locale: SiteLocale; routes: LocalizedRoute[] }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const storedValue = sessionStorage.getItem(SCROLL_STORAGE_KEY)
    if (!storedValue) return

    try {
      const stored = JSON.parse(storedValue) as Partial<StoredScroll>
      if (stored.path !== normalizePath(pathname)) {
        sessionStorage.removeItem(SCROLL_STORAGE_KEY)
        return
      }
      if (typeof stored.y !== 'number' || !Number.isFinite(stored.y) || typeof stored.progress !== 'number' || !Number.isFinite(stored.progress)) {
        sessionStorage.removeItem(SCROLL_STORAGE_KEY)
        return
      }

      const targetY = Math.max(stored.y, 0)
      const progress = Math.min(Math.max(stored.progress, 0), 1)
      const images = Array.from(document.images)
      let animationFrame: number | null = null

      const restoreScroll = () => {
        animationFrame = null
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
        window.scrollTo({ top: maxScroll >= targetY ? targetY : progress * maxScroll })
      }

      const scheduleRestore = () => {
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
        animationFrame = window.requestAnimationFrame(restoreScroll)
      }

      const observer = new ResizeObserver(scheduleRestore)
      observer.observe(document.body)
      images.forEach((image) => image.addEventListener('load', scheduleRestore))
      scheduleRestore()

      const stopObserving = window.setTimeout(() => {
        observer.disconnect()
        restoreScroll()
        sessionStorage.removeItem(SCROLL_STORAGE_KEY)
      }, 1500)

      return () => {
        window.clearTimeout(stopObserving)
        observer.disconnect()
        images.forEach((image) => image.removeEventListener('load', scheduleRestore))
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      }
    } catch {
      sessionStorage.removeItem(SCROLL_STORAGE_KEY)
      return
    }
  }, [pathname])

  const link = (targetLocale: SiteLocale, label: string, ariaLabel: string) => {
    if (locale === targetLocale) return <span className="site-language__current" aria-current="page">{label}</span>

    const targetPath = routeForLocale(pathname, locale, targetLocale, routes)
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      event.preventDefault()
      storeScroll(normalizePath(targetPath))
      router.push(`${targetPath}${window.location.search}${window.location.hash}`, { scroll: false })
    }

    return <Link href={targetPath} hrefLang={targetLocale} aria-label={ariaLabel} scroll={false} onClick={handleClick}>{label}</Link>
  }

  return (
    <nav className="site-language" aria-label={locale === 'de' ? 'Sprache wählen' : 'Choose language'}>
      {link('de', 'DE', 'Zu Deutsch wechseln')}
      <span aria-hidden="true">/</span>
      {link('en', 'EN', 'Switch to English')}
    </nav>
  )
}

export function LanguageSwitcherFallback({ locale }: { locale: SiteLocale }) {
  return (
    <nav className="site-language" aria-label={locale === 'de' ? 'Sprache wählen' : 'Choose language'}>
      {locale === 'de' ? <span className="site-language__current" aria-current="page">DE</span> : <Link href="/de" hrefLang="de" aria-label="Zu Deutsch wechseln">DE</Link>}
      <span aria-hidden="true">/</span>
      {locale === 'en' ? <span className="site-language__current" aria-current="page">EN</span> : <Link href="/en" hrefLang="en" aria-label="Switch to English">EN</Link>}
    </nav>
  )
}
