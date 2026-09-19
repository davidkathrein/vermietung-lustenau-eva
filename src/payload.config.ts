import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Accommodations } from './collections/Accommodations'
import { Pages } from './collections/Pages'
import { Inquiries } from './collections/Inquiries'
import { ManualBlocks } from './collections/ManualBlocks'
import { CalendarHealth } from './collections/CalendarHealth'
import { SlugRedirects } from './collections/SlugRedirects'
import { InstagramPosts } from './collections/InstagramPosts'
import { SiteSettings } from './globals/SiteSettings'
import { InstagramSyncStatus } from './globals/InstagramSyncStatus'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = process.env.DATABASE_URL || ''
const usePostgres = databaseURL.startsWith('postgresql://') || databaseURL.startsWith('postgres://')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Accommodations, InstagramPosts, ManualBlocks, Inquiries, CalendarHealth, SlugRedirects],
  globals: [SiteSettings, InstagramSyncStatus],
  i18n: {
    fallbackLanguage: 'de',
    supportedLanguages: { de, en },
  },
  localization: {
    locales: [
      { label: 'Deutsch', code: 'de' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  editor: lexicalEditor(),
  email: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? resendAdapter({
    apiKey: process.env.RESEND_API_KEY,
    defaultFromAddress: process.env.EMAIL_FROM,
    defaultFromName: 'Wohnen in Lustenau',
  }) : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: usePostgres ? postgresAdapter({
    pool: { connectionString: databaseURL },
    migrationDir: path.resolve(dirname, 'postgres-migrations'),
  }) : sqliteAdapter({
    push: false,
    client: {
      url: databaseURL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true,
      collections: { media: true },
      clientUploads: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
