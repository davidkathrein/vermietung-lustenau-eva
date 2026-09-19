import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`decorative\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_ai_filename\` text;`)
  await db.run(sql`CREATE INDEX \`media_sizes_ai_sizes_ai_filename_idx\` ON \`media\` (\`sizes_ai_filename\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`media_sizes_ai_sizes_ai_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`decorative\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_ai_filename\`;`)
}
