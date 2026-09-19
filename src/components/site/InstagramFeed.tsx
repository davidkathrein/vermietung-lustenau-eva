'use client'

import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, PlayIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { A11y, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteLocale } from '@/lib/locale'

import './instagram-feed.css'

type Post = {
  id: string
  permalink: string
  caption: string
  publishedAt: string | null
  imageUrl: string | null
  imageAlt: string
  imageCaption: string
  isReel: boolean
}

type FeedResult = {
  locale: SiteLocale
  requestKey: number
  state: 'ready' | 'empty' | 'error'
  posts: Post[]
  profileUrl: string | null
}

function embedUrl(permalink: string): string {
  return `${permalink}embed/`
}

export function InstagramFeed({
  locale,
  eyebrow,
  headline,
  intro,
}: {
  locale: SiteLocale
  eyebrow?: string | null
  headline: string
  intro?: string | null
}) {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [activeReel, setActiveReel] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())
  const [result, setResult] = useState<FeedResult | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const headingId = useId()

  function syncSwiper(swiper: SwiperInstance) {
    setActivePage(swiper.snapIndex)
    setPageCount(Math.max(swiper.size > 0 ? swiper.snapGrid.length : swiper.slides.length, 1))
    setCanGoBack(!swiper.isBeginning)
    setCanGoForward(!swiper.isEnd)
  }

  function goToPage(pageIndex: number) {
    const swiper = swiperRef.current
    if (!swiper) return
    const slidesPerGroup =
      typeof swiper.params.slidesPerGroup === 'number' ? swiper.params.slidesPerGroup : 1
    swiper.slideTo(pageIndex * slidesPerGroup)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/public-instagram-posts?locale=${locale}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Instagram feed request failed')
        return response.json() as Promise<{ posts?: Post[]; profileUrl?: string | null }>
      })
      .then((data) => {
        if (controller.signal.aborted) return
        const nextPosts = data.posts ?? []
        setActivePage(0)
        setPageCount(Math.max(nextPosts.length, 1))
        setResult({
          locale,
          requestKey,
          state: nextPosts.length ? 'ready' : 'empty',
          posts: nextPosts,
          profileUrl: data.profileUrl ?? null,
        })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ locale, requestKey, state: 'error', posts: [], profileUrl: null })
      })
    return () => controller.abort()
  }, [locale, requestKey])

  const currentResult =
    result?.locale === locale && result.requestKey === requestKey ? result : null
  const loadState = currentResult?.state ?? 'loading'
  const posts = currentResult?.posts ?? []
  const profileUrl = currentResult?.profileUrl ?? null
  if (loadState === 'empty') return null
  const profileName = profileUrl ? new URL(profileUrl).pathname.split('/')[1] : null

  return (
    <section
      className="site-instagram site-section"
      aria-labelledby={headingId}
      aria-busy={loadState === 'loading' || undefined}
    >
      <div className="site-container">
        <div className="site-instagram__heading">
          <div className="site-section-intro">
            {eyebrow && <p className="site-eyebrow">{eyebrow}</p>}
            <h2 id={headingId}>{headline}</h2>
            {intro && <p className="site-section-intro__text">{intro}</p>}
          </div>
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-instagram__profile"
            >
              @{profileName} <ArrowUpRightIcon aria-hidden="true" />
            </a>
          )}
        </div>
        {loadState === 'loading' && (
          <div className="site-instagram__loading" role="status">
            <span>
              {locale === 'de' ? 'Instagram-Beiträge werden geladen.' : 'Loading Instagram posts.'}
            </span>
            <div className="site-instagram__loading-grid" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <Card key={item} className="site-instagram__card site-instagram__loading-card">
                  <div className="site-instagram__media" />
                  <CardContent className="site-instagram__content">
                    <i />
                    <i />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {loadState === 'error' && (
          <Alert className="site-instagram__error">
            <AlertTitle>
              {locale === 'de'
                ? 'Instagram konnte nicht geladen werden.'
                : 'Instagram could not be loaded.'}
            </AlertTitle>
            <AlertDescription>
              {locale === 'de' ? 'Bitte versuchen Sie es erneut.' : 'Please try again.'}
            </AlertDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRequestKey((value) => value + 1)}
            >
              {locale === 'de' ? 'Erneut versuchen' : 'Try again'}
            </Button>
          </Alert>
        )}
        {loadState === 'ready' && (
          <div className="site-instagram__carousel">
            <Swiper
              className="site-instagram__swiper"
              modules={[A11y, Keyboard]}
              slidesPerView={1.12}
              slidesPerGroup={1}
              spaceBetween={16}
              watchOverflow
              keyboard={{ enabled: true, onlyInViewport: true }}
              a11y={{
                enabled: true,
                prevSlideMessage:
                  locale === 'de' ? 'Vorherige Instagram-Beiträge' : 'Previous Instagram posts',
                nextSlideMessage:
                  locale === 'de' ? 'Nächste Instagram-Beiträge' : 'Next Instagram posts',
              }}
              breakpoints={{
                640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
                syncSwiper(swiper)
              }}
              onInit={syncSwiper}
              onSlideChange={syncSwiper}
              onSnapGridLengthChange={syncSwiper}
              onBreakpoint={syncSwiper}
              onResize={syncSwiper}
            >
              {posts.map((post) => {
                const imageUrl = failedImages.has(post.id) ? null : post.imageUrl
                return (
                  <SwiperSlide key={post.id}>
                    <Card
                      className={`site-instagram__card ${!imageUrl && !post.isReel ? 'site-instagram__card--text-only' : ''}`}
                    >
                      {(imageUrl || post.isReel) && (
                        <div className="site-instagram__media">
                          {post.isReel && activeReel === post.id ? (
                            <iframe
                              src={embedUrl(post.permalink)}
                              title={
                                post.caption ||
                                (locale === 'de' ? 'Instagram-Reel' : 'Instagram reel')
                              }
                              loading="lazy"
                              allow="encrypted-media; picture-in-picture"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          ) : (
                            <>
                              {imageUrl ? (
                                <>
                                  {/* Uploads can live locally or in Vercel Blob. */}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imageUrl}
                                    alt={post.imageAlt || ''}
                                    loading="lazy"
                                    onError={() =>
                                      setFailedImages((current) => new Set(current).add(post.id))
                                    }
                                  />
                                  {post.imageCaption && (
                                    <span className="site-instagram__image-caption">
                                      {post.imageCaption}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="site-instagram__fallback">Instagram</span>
                              )}
                              {post.isReel && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon-lg"
                                  className="site-instagram__play"
                                  onClick={() => setActiveReel(post.id)}
                                  aria-label={locale === 'de' ? 'Reel abspielen' : 'Play reel'}
                                >
                                  <PlayIcon weight="fill" aria-hidden="true" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <CardContent className="site-instagram__content">
                        {post.publishedAt && (
                          <div className="site-instagram__meta">
                            <time dateTime={post.publishedAt}>
                              {new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }).format(new Date(post.publishedAt))}
                            </time>
                          </div>
                        )}
                        {post.caption && <p>{post.caption}</p>}
                        <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                          {locale === 'de' ? 'Auf Instagram ansehen' : 'View on Instagram'}{' '}
                          <ArrowUpRightIcon aria-hidden="true" />
                        </a>
                      </CardContent>
                    </Card>
                  </SwiperSlide>
                )
              })}
            </Swiper>
            {posts.length > 1 && (
              <div className="site-instagram__controls">
                <div
                  className="site-instagram__pagination"
                  role="group"
                  aria-label={locale === 'de' ? 'Instagram-Seiten' : 'Instagram pages'}
                >
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className="site-instagram__page"
                      aria-current={index === activePage ? 'page' : undefined}
                      aria-label={
                        locale === 'de'
                          ? `Seite ${index + 1} von ${pageCount}`
                          : `Page ${index + 1} of ${pageCount}`
                      }
                      onClick={() => goToPage(index)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
                <div className="site-instagram__navigation">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => swiperRef.current?.slidePrev()}
                    disabled={!canGoBack}
                    aria-label={
                      locale === 'de' ? 'Vorherige Instagram-Beiträge' : 'Previous Instagram posts'
                    }
                  >
                    <ArrowLeftIcon aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => swiperRef.current?.slideNext()}
                    disabled={!canGoForward}
                    aria-label={
                      locale === 'de' ? 'Nächste Instagram-Beiträge' : 'Next Instagram posts'
                    }
                  >
                    <ArrowRightIcon aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
