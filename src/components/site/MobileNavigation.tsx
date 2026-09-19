'use client'

import { ListIcon, XIcon } from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

type MobileNavigationProps = {
  children: ReactNode
  closeLabel: string
  openLabel: string
}

export function MobileNavigation({ children, closeLabel, openLabel }: MobileNavigationProps) {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const pathname = usePathname()
  const open = openPath === pathname

  useEffect(() => {
    const header = buttonRef.current?.closest('header')
    header?.setAttribute('data-menu-open', String(open))

    if (!open) return () => header?.removeAttribute('data-menu-open')

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenPath(null)
      buttonRef.current?.focus()
    }

    const desktopQuery = window.matchMedia('(min-width: 761px)')
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    desktopQuery.addEventListener('change', closeAtDesktop)

    return () => {
      header?.removeAttribute('data-menu-open')
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', closeAtDesktop)
    }
  }, [open])

  return <div className="site-mobile-menu" onBlurCapture={(event) => {
    if (open && event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpenPath(null)
  }}>
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      size="icon-lg"
      className="site-mobile-menu__toggle"
      aria-controls={menuId}
      aria-expanded={open}
      aria-label={open ? closeLabel : openLabel}
      onClick={() => setOpenPath((current) => current === pathname ? null : pathname)}
    >
      {open ? <XIcon aria-hidden="true" /> : <ListIcon aria-hidden="true" />}
    </Button>
    <div
      id={menuId}
      className="site-mobile-menu__panel"
      data-open={open}
      hidden={!open}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest('a[href]')) setOpenPath(null)
      }}
    >
      <div className="site-container site-mobile-menu__inner">{children}</div>
    </div>
  </div>
}
