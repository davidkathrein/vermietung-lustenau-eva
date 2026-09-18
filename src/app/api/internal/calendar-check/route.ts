import config from '@payload-config'
import { getPayload } from 'payload'

import { probeFeed } from '@/lib/availability'
import { authorizedCron } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request): Promise<Response> {
  if (!authorizedCron(request)) return new Response('Unauthorized', { status: 401 })
  const payload = await getPayload({ config })
  const units = await payload.find({ collection: 'accommodations', depth: 0, limit: 100, where: { published: { equals: true } } })
  const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'de', depth: 0 })
  const recipients = [...new Set([process.env.SUPPORT_EMAIL, settings.contactEmail].filter((value): value is string => Boolean(value)))]
  const mailReady = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && recipients.length)
  const summary = { checked: 0, failures: 0, alertsSent: 0, recoveriesSent: 0, emailPending: 0 }

  for (const unit of units.docs) {
    for (const provider of ['airbnb', 'booking'] as const) {
      const url = unit.ical?.[provider]?.trim()
      if (!url) continue
      summary.checked += 1
      const key = `${unit.id}:${provider}`
      const existing = (await payload.find({ collection: 'calendar-health', where: { key: { equals: key } }, limit: 1, depth: 0 })).docs[0]
      const now = new Date().toISOString()
      let healthy = false
      try { await probeFeed(url); healthy = true } catch { summary.failures += 1 }

      const sendNotice = async (subject: string, text: string): Promise<boolean> => {
        if (!mailReady) { summary.emailPending += 1; return false }
        try { await payload.sendEmail({ to: recipients, subject, text }); return true }
        catch { summary.emailPending += 1; return false }
      }

      if (healthy) {
        let alertedAt = existing?.alertedAt ?? undefined
        if (alertedAt && await sendNotice(`Kalender wieder erreichbar: ${unit.name} / ${provider}`, `Der ${provider}-Kalender für ${unit.name} ist seit ${now} wieder erreichbar.`)) {
          alertedAt = undefined
          summary.recoveriesSent += 1
        }
        const data = { key, accommodation: unit.id, provider, consecutiveFailures: 0, lastSuccessAt: now, alertedAt }
        if (existing) await payload.update({ collection: 'calendar-health', id: existing.id, data })
        else await payload.create({ collection: 'calendar-health', data })
      } else {
        const consecutiveFailures = (existing?.consecutiveFailures ?? 0) + 1
        let alertedAt = existing?.alertedAt ?? undefined
        if (consecutiveFailures >= 3 && !alertedAt && await sendNotice(`Kalender nicht erreichbar: ${unit.name} / ${provider}`, `Der ${provider}-Kalender für ${unit.name} war bei ${consecutiveFailures} aufeinanderfolgenden Prüfungen nicht erreichbar. Bitte Verbindung und Belegung manuell prüfen. Letzter Fehlversuch: ${now}.`)) {
          alertedAt = now
          summary.alertsSent += 1
        }
        const data = { key, accommodation: unit.id, provider, consecutiveFailures, lastFailureAt: now, alertedAt }
        if (existing) await payload.update({ collection: 'calendar-health', id: existing.id, data })
        else await payload.create({ collection: 'calendar-health', data })
      }
    }
  }
  return Response.json(summary, { headers: { 'Cache-Control': 'no-store' } })
}
