import type { CollectionAfterChangeHook } from 'payload'

import { getAvailability } from '../lib/availability'
import type { Accommodation, Inquiry, ManualBlock } from '../payload-types'

type Usage = 'stay' | 'seminar' | 'manual'

function day(value: string): string { return value.slice(0, 10) }

function nextDay(value: string): string {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function previousDay(value: string): string {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function idOf(value: number | { id: number }): number { return typeof value === 'number' ? value : value.id }

export function blocksConflict(candidate: { start: string; end: string; usage: Usage }, existing: { start: string; end: string; usage: Usage }): boolean {
  if (candidate.usage === 'seminar' && existing.usage === 'stay') return candidate.start <= existing.end && existing.start < candidate.end
  if (candidate.usage === 'stay' && existing.usage === 'seminar') return existing.start <= candidate.end && candidate.start < existing.end
  return candidate.start < existing.end && existing.start < candidate.end
}

export const syncInquiryBlock: CollectionAfterChangeHook<Inquiry> = async ({ doc, previousDoc, req }) => {
  if (doc.status === 'cancelled') {
    const own = await req.payload.find({ collection: 'manual-blocks', where: { inquiry: { equals: doc.id } }, depth: 0, limit: 20, req })
    for (const block of own.docs) if (block.active) await req.payload.update({ collection: 'manual-blocks', id: block.id, data: { active: false }, req })
    return doc
  }
  if (doc.status !== 'confirmed') return doc

  const currentIDs = doc.accommodations.map(idOf)
  const previousIDs = previousDoc?.accommodations?.map(idOf) ?? []
  const unchanged = previousDoc?.status === 'confirmed' && doc.kind === previousDoc.kind && doc.arrival === previousDoc.arrival && doc.departure === previousDoc.departure && currentIDs.length === previousIDs.length && currentIDs.every((id) => previousIDs.includes(id))
  if (unchanged) return doc

  const start = day(doc.arrival)
  const end = doc.kind === 'seminar' ? nextDay(doc.departure ? day(doc.departure) : start) : doc.departure ? day(doc.departure) : ''
  if (!end || end <= start) throw new Error('Ungültiger Belegungszeitraum.')
  const usage: Usage = doc.kind === 'seminar' ? 'seminar' : 'stay'
  const candidate = { start, end, usage }
  const own = await req.payload.find({ collection: 'manual-blocks', where: { inquiry: { equals: doc.id } }, depth: 0, limit: 20, req })
  const ownByUnit = new Map<number, ManualBlock>(own.docs.map((block) => [idOf(block.accommodation), block]))

  for (const unitID of currentIDs) {
    const unit = await req.payload.findByID({ collection: 'accommodations', id: unitID, depth: 0, req }) as Accommodation
    if (usage === 'seminar' && !unit.seminarCapable) throw new Error('Diese Wohnung kann nicht als Seminarraum genutzt werden.')
    const otherBlocks = await req.payload.find({
      collection: 'manual-blocks',
      where: { accommodation: { equals: unitID }, active: { equals: true }, startDate: { less_than_equal: `${end}T23:59:59.999Z` }, endDate: { greater_than_equal: `${start}T00:00:00.000Z` } },
      depth: 0, limit: 100, req,
    })
    for (const block of otherBlocks.docs) {
      if (block.inquiry && idOf(block.inquiry) === doc.id) continue
      if (blocksConflict(candidate, { start: day(block.startDate), end: day(block.endDate), usage: block.usage || 'manual' })) throw new Error(`Wohnung ${unit.name} ist im gewählten Zeitraum bereits gesperrt.`)
    }

    const feedStart = usage === 'seminar' ? previousDay(start) : start
    const feedThrough = previousDay(end)
    const availability = await getAvailability(unit, feedStart, feedThrough)
    if (availability.blockedDates.some((blockedDay) => blockedDay >= feedStart && blockedDay <= feedThrough)) throw new Error(`Plattform-Kalender meldet ${unit.name} im gewählten Zeitraum als belegt.`)
    if (availability.state !== 'ready' && !doc.confirmDespiteUnknown) throw new Error(`Plattform-Verfügbarkeit für ${unit.name} ist unbekannt. Vor einer Zusage manuell prüfen und die Ausnahme bestätigen.`)

    const data = { accommodation: unitID, inquiry: doc.id, startDate: start, endDate: end, usage, active: true, reason: `Zusage Anfrage #${doc.id}` } as const
    const existing = ownByUnit.get(unitID)
    if (existing) await req.payload.update({ collection: 'manual-blocks', id: existing.id, data, req })
    else await req.payload.create({ collection: 'manual-blocks', data, req })
  }

  for (const block of own.docs) if (!currentIDs.includes(idOf(block.accommodation)) && block.active) {
    await req.payload.update({ collection: 'manual-blocks', id: block.id, data: { active: false }, req })
  }
  return doc
}
