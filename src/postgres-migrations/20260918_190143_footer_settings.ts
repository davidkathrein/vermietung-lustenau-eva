import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_footer_links_link_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TABLE "site_settings_footer_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_kind" "enum_site_settings_footer_links_link_kind" DEFAULT 'internal' NOT NULL,
    "link_url" varchar,
    "link_email" varchar,
    "link_phone" varchar,
    "link_anchor" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "site_settings_footer_links_locales" (
    "link_label" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_apartments_heading" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_links_heading" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_contact_heading" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "footer_copyright_text" varchar;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links_locales" ADD CONSTRAINT "site_settings_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_footer_links_locales_locale_parent_id_unique" ON "site_settings_footer_links_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings_footer_links_locales" CASCADE;
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_apartments_heading";
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_links_heading";
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_contact_heading";
  ALTER TABLE "site_settings_locales" DROP COLUMN "footer_copyright_text";
  DROP TYPE "public"."enum_site_settings_footer_links_link_kind";`)
}
