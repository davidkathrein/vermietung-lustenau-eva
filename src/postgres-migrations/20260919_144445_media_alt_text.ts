import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "decorative" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_ai_filename" varchar;
  CREATE INDEX "media_sizes_ai_sizes_ai_filename_idx" ON "media" USING btree ("sizes_ai_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_ai_sizes_ai_filename_idx";
  ALTER TABLE "media" DROP COLUMN "decorative";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_url";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_width";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_height";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_ai_filename";`)
}
