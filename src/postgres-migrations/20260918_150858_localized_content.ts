import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site_settings_locales" ADD COLUMN "country" varchar;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  INSERT INTO "media_locales" ("alt", "_locale", "_parent_id")
    SELECT "alt", 'de'::_locales, "id" FROM "media";
  UPDATE "site_settings_locales" SET "country" =
    (SELECT "country" FROM "site_settings" WHERE "site_settings"."id" = "site_settings_locales"."_parent_id")
    WHERE "_locale" = 'de'::_locales;
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "site_settings" DROP COLUMN "country";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "alt" varchar NOT NULL DEFAULT '';
  UPDATE "media" SET "alt" = COALESCE(
    (SELECT "alt" FROM "media_locales" WHERE "_parent_id" = "media"."id" AND "_locale" = 'de'::_locales),
    (SELECT "alt" FROM "media_locales" WHERE "_parent_id" = "media"."id" LIMIT 1), '');
  ALTER TABLE "media" ALTER COLUMN "alt" DROP DEFAULT;
  ALTER TABLE "site_settings" ADD COLUMN "country" varchar;
  UPDATE "site_settings" SET "country" =
    (SELECT "country" FROM "site_settings_locales" WHERE "_parent_id" = "site_settings"."id" AND "_locale" = 'de'::_locales);
  DROP TABLE "media_locales" CASCADE;
  ALTER TABLE "site_settings_locales" DROP COLUMN "country";`)
}
