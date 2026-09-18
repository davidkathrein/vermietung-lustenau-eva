import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Accommodations } from './collections/Accommodations'
import { Inquiries } from './collections/Inquiries'
import { ManualBlocks } from './collections/ManualBlocks'
import { SiteSettings } from './globals/SiteSettings'

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
  collections: [Users, Media, Accommodations, ManualBlocks, Inquiries],
  globals: [SiteSettings],
  localization: {
    locales: [
      { label: 'Deutsch', code: 'de' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: usePostgres ? postgresAdapter({
    pool: { connectionString: databaseURL },
    migrationDir: path.resolve(dirname, 'postgres-migrations'),
  }) : sqliteAdapter({
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
