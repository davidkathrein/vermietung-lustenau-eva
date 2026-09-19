import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`instagram_posts\` ADD \`source_profile\` text;`)
  await db.run(sql`CREATE INDEX \`instagram_posts_source_profile_idx\` ON \`instagram_posts\` (\`source_profile\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`instagram_posts_source_profile_idx\`;`)
  await db.run(sql`ALTER TABLE \`instagram_posts\` DROP COLUMN \`source_profile\`;`)
}
