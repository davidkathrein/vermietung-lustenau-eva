import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "instagram_posts" ADD COLUMN "source_profile" varchar;`)
  await db.execute(sql`CREATE INDEX "instagram_posts_source_profile_idx" ON "instagram_posts" USING btree ("source_profile");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX "instagram_posts_source_profile_idx";`)
  await db.execute(sql`ALTER TABLE "instagram_posts" DROP COLUMN "source_profile";`)
}
