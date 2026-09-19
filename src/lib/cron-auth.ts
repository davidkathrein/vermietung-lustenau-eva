import { timingSafeEqual } from 'node:crypto'

export function authorizedCron(request: Request): boolean {
  const expected = process.env.CRON_SECRET
  const actual = request.headers.get('authorization')?.match(/^Bearer\s+([^\s]+)$/i)?.[1]
  if (!expected || expected.length < 32 || !actual || Buffer.byteLength(actual) !== Buffer.byteLength(expected)) return false
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}
