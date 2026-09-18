import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "instagram_sync_status" (
    "id" serial PRIMARY KEY NOT NULL,
    "snapshot_id" varchar,
    "started_at" timestamp(3) with time zone,
    "completed_at" timestamp(3) with time zone,
    "profile_url" varchar,
    "last_error" varchar,
    "last_imported_count" numeric,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "instagram_sync_status" CASCADE;`)
}
