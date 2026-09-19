'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const HIDE_DISTANCE = 12
const SHOW_DISTANCE = 4

export function ScrollAwareHeader({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const header = headerRef.current
    let animationFrame: number | null = null
    let previousY = Math.max(window.scrollY, 0)
    let directionStartY = previousY
    let direction: 'up' | 'down' | null = null

    const updateVisibility = () => {
      animationFrame = null

      const currentY = Math.max(window.scrollY, 0)
      const delta = currentY - previousY
      const nextDirection = delta > 0 ? 'down' : delta < 0 ? 'up' : direction

      if (nextDirection !== direction) {
        direction = nextDirection
        directionStartY = previousY
      }

      const distance = Math.abs(currentY - directionStartY)
      const headerHeight = header?.offsetHeight ?? 0

      if (currentY <= headerHeight) {
        setIsVisible(true)
      } else if (direction === 'down' && distance >= HIDE_DISTANCE) {
        setIsVisible(false)
      } else if (direction === 'up' && distance >= SHOW_DISTANCE) {
        setIsVisible(true)
      }

      previousY = currentY
    }

    const handleScroll = () => {
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateVisibility)
    }

    header?.setAttribute('data-scroll-aware', 'true')
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      header?.removeAttribute('data-scroll-aware')
      window.removeEventListener('scroll', handleScroll)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-visible={isVisible}
      onFocusCapture={() => setIsVisible(true)}
    >
      {children}
    </header>
  )
}
