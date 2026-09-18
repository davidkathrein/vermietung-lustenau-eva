import config from '@payload-config'
import { getPayload } from 'payload'

import { instagramPostUrl, instagramProfileUrl } from '@/lib/instagram-sync'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  const locale = new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'de'
  const profileUrl = instagramProfileUrl(process.env.INSTAGRAM_PROFILE_URL)
  if (!profileUrl) return Response.json({ posts: [], profileUrl: null }, { headers: { 'Cache-Control': 'no-store' } })
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'instagram-posts',
    locale,
    fallbackLocale: 'de',
    depth: 1,
    limit: 12,
    sort: '-publishedAt',
    where: { and: [{ visible: { equals: true } }, { sourceProfile: { equals: profileUrl } }] },
  })
  const posts = result.docs.flatMap((post) => {
    const permalink = instagramPostUrl(post.permalink)
    if (!permalink) return []
    const image = typeof post.image === 'object' ? post.image : null
    return [{
      id: post.externalId,
      permalink,
      caption: post.caption || '',
      publishedAt: post.publishedAt || null,
      imageUrl: image?.url || null,
      imageAlt: image?.alt || '',
      imageCaption: image?.caption || '',
      isReel: permalink.includes('/reel/'),
    }]
  })
  return Response.json({ posts, profileUrl }, { headers: { 'Cache-Control': 'no-store' } })
}
