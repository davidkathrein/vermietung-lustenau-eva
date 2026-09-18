import { cookies, draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  const cookieStore = await cookies()
  cookieStore.delete('preview-page-id')
  return NextResponse.redirect(new URL('/de', request.url), 303)
}
