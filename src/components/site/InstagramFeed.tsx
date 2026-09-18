'use client'

import { ArrowUpRightIcon, PlayIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
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

function embedUrl(permalink: string): string {
  return `${permalink}embed/`
}

export function InstagramFeed({ locale }: { locale: SiteLocale }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [activeReel, setActiveReel] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/public-instagram-posts?locale=${locale}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: { posts?: Post[]; profileUrl?: string | null } | null) => {
        if (data?.posts) setPosts(data.posts)
        if (data?.profileUrl) setProfileUrl(data.profileUrl)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [locale])

  if (!posts.length) return null
  const profileName = profileUrl ? new URL(profileUrl).pathname.split('/')[1] : null

  return <section className="site-instagram site-section" aria-labelledby="site-instagram-title">
    <div className="site-container">
      <div className="site-instagram__heading">
        <div><p className="site-eyebrow">Instagram</p><h2 id="site-instagram-title">{locale === 'de' ? 'Einblicke auf Instagram' : 'From Instagram'}</h2></div>
        {profileUrl && <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="site-instagram__profile">@{profileName} <ArrowUpRightIcon aria-hidden="true" /></a>}
      </div>
      <div className="site-instagram__grid">
        {posts.map((post) => <Card key={post.id} className="site-instagram__card">
          <div className="site-instagram__media">
            {post.isReel && activeReel === post.id ? <iframe src={embedUrl(post.permalink)} title={post.caption || (locale === 'de' ? 'Instagram-Reel' : 'Instagram reel')} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>
              {post.imageUrl ? <>
                {/* Uploads can live locally or in Vercel Blob. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt={post.imageAlt || post.caption || 'Instagram'} loading="lazy" />
                {post.imageCaption && <span className="site-instagram__image-caption">{post.imageCaption}</span>}
              </> : <span className="site-instagram__fallback">Instagram</span>}
              {post.isReel && <Button type="button" variant="secondary" size="icon-lg" className="site-instagram__play" onClick={() => setActiveReel(post.id)} aria-label={locale === 'de' ? 'Reel abspielen' : 'Play reel'}><PlayIcon weight="fill" aria-hidden="true" /></Button>}
            </>}
          </div>
          <CardContent className="site-instagram__content">
            <div className="site-instagram__meta"><Badge variant="outline">{post.isReel ? 'Reel' : locale === 'de' ? 'Bild' : 'Photo'}</Badge>{post.publishedAt && <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(post.publishedAt))}</time>}</div>
            {post.caption && <p>{post.caption}</p>}
            <a href={post.permalink} target="_blank" rel="noopener noreferrer">{locale === 'de' ? 'Auf Instagram ansehen' : 'View on Instagram'} <ArrowUpRightIcon aria-hidden="true" /></a>
          </CardContent>
        </Card>)}
      </div>
    </div>
  </section>
}
