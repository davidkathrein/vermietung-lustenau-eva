import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`instagram_sync_status\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`snapshot_id\` text,
    \`started_at\` text,
    \`completed_at\` text,
    \`profile_url\` text,
    \`last_error\` text,
    \`last_imported_count\` numeric,
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`instagram_sync_status\`;`)
}
