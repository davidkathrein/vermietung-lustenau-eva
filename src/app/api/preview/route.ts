import config from '@payload-config'
import { cookies, draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isSiteLocale } from '@/lib/locale'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') || 'de'
  const id = url.searchParams.get('id')
  if (!isSiteLocale(locale) || !id || !/^\d+$/.test(id)) {
    return new Response('Save this page as a draft before previewing it.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers }).catch(() => null)
  if (!auth?.user) return new Response('Unauthorized', { status: 403 })

  const page = await payload.findByID({ collection: 'pages', id: Number(id), locale, fallbackLocale: false, draft: true, depth: 0, user: auth.user, overrideAccess: false }).catch(() => null)
  if (!page) return new Response('Page not found', { status: 404 })

  const draft = await draftMode()
  draft.enable()
  const cookieStore = await cookies()
  cookieStore.set('preview-page-id', id, { httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', path: '/' })
  return NextResponse.redirect(new URL(`/${locale}/__preview/${id}`, request.url))
}
