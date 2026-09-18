import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_actions_link_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum_pages_blocks_cta_action_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum_pages_blocks_content_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_content_action_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum_pages_blocks_inquiry_mode" AS ENUM('both', 'stay', 'seminar');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_actions_link_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_action_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum__pages_v_blocks_content_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_content_action_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  CREATE TYPE "public"."enum__pages_v_blocks_inquiry_mode" AS ENUM('both', 'stay', 'seminar');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_accommodations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__accommodations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__accommodations_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_manual_blocks_usage" AS ENUM('manual', 'stay', 'seminar');
  CREATE TYPE "public"."enum_calendar_health_provider" AS ENUM('airbnb', 'booking');
  CREATE TYPE "public"."enum_slug_redirects_target_collection" AS ENUM('pages', 'accommodations');
  CREATE TYPE "public"."enum_site_settings_navigation_link_kind" AS ENUM('internal', 'url', 'email', 'phone', 'anchor');
  ALTER TYPE "public"."enum_inquiries_status" ADD VALUE 'confirmed' BEFORE 'closed';
  ALTER TYPE "public"."enum_inquiries_status" ADD VALUE 'cancelled' BEFORE 'closed';
  CREATE TABLE "pages_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_kind" "enum_pages_blocks_hero_actions_link_kind" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_email" varchar,
  	"link_phone" varchar,
  	"link_anchor" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_hero_actions_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_locales" (
  	"headline" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"action_kind" "enum_pages_blocks_cta_action_kind" DEFAULT 'internal',
  	"action_url" varchar,
  	"action_email" varchar,
  	"action_phone" varchar,
  	"action_anchor" varchar,
  	"action_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"action_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_pages_blocks_content_image_side" DEFAULT 'right',
  	"action_kind" "enum_pages_blocks_content_action_kind" DEFAULT 'internal',
  	"action_url" varchar,
  	"action_email" varchar,
  	"action_phone" varchar,
  	"action_anchor" varchar,
  	"action_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"body" jsonb,
  	"action_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_accommodation_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_accommodation_overview_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_inquiry" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_pages_blocks_inquiry_mode" DEFAULT 'both',
  	"accommodation_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_inquiry_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_name" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"slug" varchar,
  	"title" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"accommodations_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_kind" "enum__pages_v_blocks_hero_actions_link_kind" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_email" varchar,
  	"link_phone" varchar,
  	"link_anchor" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_actions_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_locales" (
  	"headline" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"action_kind" "enum__pages_v_blocks_cta_action_kind" DEFAULT 'internal',
  	"action_url" varchar,
  	"action_email" varchar,
  	"action_phone" varchar,
  	"action_anchor" varchar,
  	"action_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"action_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum__pages_v_blocks_content_image_side" DEFAULT 'right',
  	"action_kind" "enum__pages_v_blocks_content_action_kind" DEFAULT 'internal',
  	"action_url" varchar,
  	"action_email" varchar,
  	"action_phone" varchar,
  	"action_anchor" varchar,
  	"action_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"body" jsonb,
  	"action_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_accommodation_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_accommodation_overview_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_inquiry" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__pages_v_blocks_inquiry_mode" DEFAULT 'both',
  	"accommodation_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inquiry_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_internal_name" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"accommodations_id" integer
  );
  
  CREATE TABLE "_accommodations_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_accommodations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_sleeps" numeric,
  	"version_size_sqm" numeric,
  	"version_seminar_capable" boolean DEFAULT false,
  	"version_seminar_capacity" numeric,
  	"version_floorplan_id" integer,
  	"version_ical_airbnb" varchar,
  	"version_ical_booking" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__accommodations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__accommodations_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_accommodations_v_locales" (
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_teaser" varchar,
  	"version_description" varchar,
  	"version_bed_setup" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "calendar_health" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"accommodation_id" integer NOT NULL,
  	"provider" "enum_calendar_health_provider" NOT NULL,
  	"consecutive_failures" numeric DEFAULT 0 NOT NULL,
  	"last_success_at" timestamp(3) with time zone,
  	"last_failure_at" timestamp(3) with time zone,
  	"alerted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "slug_redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_path" varchar NOT NULL,
  	"target_collection" "enum_slug_redirects_target_collection" NOT NULL,
  	"target_id" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_kind" "enum_site_settings_navigation_link_kind" DEFAULT 'internal' NOT NULL,
  	"link_url" varchar,
  	"link_email" varchar,
  	"link_phone" varchar,
  	"link_anchor" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_navigation_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"accommodations_id" integer
  );
  
  ALTER TABLE "accommodations_gallery_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "accommodations_gallery_locales" CASCADE;
  DROP INDEX "accommodations_slug_idx";
  ALTER TABLE "accommodations_gallery" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "accommodations" ALTER COLUMN "sleeps" DROP NOT NULL;
  ALTER TABLE "accommodations_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "accommodations_locales" ALTER COLUMN "teaser" DROP NOT NULL;
  ALTER TABLE "media_locales" ADD COLUMN "caption" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "_status" "enum_accommodations_status" DEFAULT 'draft';
  ALTER TABLE "accommodations_locales" ADD COLUMN "slug" varchar;
  UPDATE "accommodations_locales" SET "slug" = "accommodations"."slug" FROM "accommodations" WHERE "accommodations"."id" = "accommodations_locales"."_parent_id";
  ALTER TABLE "manual_blocks" ADD COLUMN "inquiry_id" integer;
  ALTER TABLE "manual_blocks" ADD COLUMN "usage" "enum_manual_blocks_usage" DEFAULT 'manual';
  ALTER TABLE "manual_blocks" ADD COLUMN "active" boolean DEFAULT true;
  ALTER TABLE "inquiries" ADD COLUMN "confirm_despite_unknown" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "calendar_health_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "slug_redirects_id" integer;
  ALTER TABLE "pages_blocks_hero_actions" ADD CONSTRAINT "pages_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_actions_locales" ADD CONSTRAINT "pages_blocks_hero_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_locales" ADD CONSTRAINT "pages_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_locales" ADD CONSTRAINT "pages_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_locales" ADD CONSTRAINT "pages_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items_locales" ADD CONSTRAINT "pages_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_locales" ADD CONSTRAINT "pages_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_accommodation_overview" ADD CONSTRAINT "pages_blocks_accommodation_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_accommodation_overview_locales" ADD CONSTRAINT "pages_blocks_accommodation_overview_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_accommodation_overview"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inquiry" ADD CONSTRAINT "pages_blocks_inquiry_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_inquiry" ADD CONSTRAINT "pages_blocks_inquiry_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inquiry_locales" ADD CONSTRAINT "pages_blocks_inquiry_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inquiry"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_accommodations_fk" FOREIGN KEY ("accommodations_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_actions" ADD CONSTRAINT "_pages_v_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_actions_locales" ADD CONSTRAINT "_pages_v_blocks_hero_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_locales" ADD CONSTRAINT "_pages_v_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_locales" ADD CONSTRAINT "_pages_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items_locales" ADD CONSTRAINT "_pages_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_locales" ADD CONSTRAINT "_pages_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_accommodation_overview" ADD CONSTRAINT "_pages_v_blocks_accommodation_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_accommodation_overview_locales" ADD CONSTRAINT "_pages_v_blocks_accommodation_overview_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_accommodation_overview"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inquiry" ADD CONSTRAINT "_pages_v_blocks_inquiry_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inquiry" ADD CONSTRAINT "_pages_v_blocks_inquiry_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inquiry_locales" ADD CONSTRAINT "_pages_v_blocks_inquiry_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inquiry"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_accommodations_fk" FOREIGN KEY ("accommodations_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_accommodations_v_version_gallery" ADD CONSTRAINT "_accommodations_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_accommodations_v_version_gallery" ADD CONSTRAINT "_accommodations_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_accommodations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_accommodations_v" ADD CONSTRAINT "_accommodations_v_parent_id_accommodations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_accommodations_v" ADD CONSTRAINT "_accommodations_v_version_floorplan_id_media_id_fk" FOREIGN KEY ("version_floorplan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_accommodations_v_locales" ADD CONSTRAINT "_accommodations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_accommodations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calendar_health" ADD CONSTRAINT "calendar_health_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation_locales" ADD CONSTRAINT "site_settings_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_accommodations_fk" FOREIGN KEY ("accommodations_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_actions_order_idx" ON "pages_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_actions_parent_id_idx" ON "pages_blocks_hero_actions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_actions_locales_locale_parent_id_unique" ON "pages_blocks_hero_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_locales_locale_parent_id_unique" ON "pages_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cta_locales_locale_parent_id_unique" ON "pages_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_image_idx" ON "pages_blocks_content" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_content_locales_locale_parent_id_unique" ON "pages_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_faq_items_locales_locale_parent_id_unique" ON "pages_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_faq_locales_locale_parent_id_unique" ON "pages_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_accommodation_overview_order_idx" ON "pages_blocks_accommodation_overview" USING btree ("_order");
  CREATE INDEX "pages_blocks_accommodation_overview_parent_id_idx" ON "pages_blocks_accommodation_overview" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_accommodation_overview_path_idx" ON "pages_blocks_accommodation_overview" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_accommodation_overview_locales_locale_parent_id" ON "pages_blocks_accommodation_overview_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_inquiry_order_idx" ON "pages_blocks_inquiry" USING btree ("_order");
  CREATE INDEX "pages_blocks_inquiry_parent_id_idx" ON "pages_blocks_inquiry" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inquiry_path_idx" ON "pages_blocks_inquiry" USING btree ("_path");
  CREATE INDEX "pages_blocks_inquiry_accommodation_idx" ON "pages_blocks_inquiry" USING btree ("accommodation_id");
  CREATE UNIQUE INDEX "pages_blocks_inquiry_locales_locale_parent_id_unique" ON "pages_blocks_inquiry_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_internal_name_idx" ON "pages" USING btree ("internal_name");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_accommodations_id_idx" ON "pages_rels" USING btree ("accommodations_id");
  CREATE INDEX "_pages_v_blocks_hero_actions_order_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_actions_parent_id_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_actions_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_locales_locale_parent_id_unique" ON "_pages_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_image_idx" ON "_pages_v_blocks_content" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_locales_locale_parent_id_unique" ON "_pages_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_accommodation_overview_order_idx" ON "_pages_v_blocks_accommodation_overview" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_accommodation_overview_parent_id_idx" ON "_pages_v_blocks_accommodation_overview" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_accommodation_overview_path_idx" ON "_pages_v_blocks_accommodation_overview" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_accommodation_overview_locales_locale_parent" ON "_pages_v_blocks_accommodation_overview_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_inquiry_order_idx" ON "_pages_v_blocks_inquiry" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inquiry_parent_id_idx" ON "_pages_v_blocks_inquiry" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inquiry_path_idx" ON "_pages_v_blocks_inquiry" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inquiry_accommodation_idx" ON "_pages_v_blocks_inquiry" USING btree ("accommodation_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_inquiry_locales_locale_parent_id_unique" ON "_pages_v_blocks_inquiry_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_internal_name_idx" ON "_pages_v" USING btree ("version_internal_name");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_accommodations_id_idx" ON "_pages_v_rels" USING btree ("accommodations_id");
  CREATE INDEX "_accommodations_v_version_gallery_order_idx" ON "_accommodations_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_accommodations_v_version_gallery_parent_id_idx" ON "_accommodations_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_accommodations_v_version_gallery_image_idx" ON "_accommodations_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_accommodations_v_parent_idx" ON "_accommodations_v" USING btree ("parent_id");
  CREATE INDEX "_accommodations_v_version_version_floorplan_idx" ON "_accommodations_v" USING btree ("version_floorplan_id");
  CREATE INDEX "_accommodations_v_version_version_published_idx" ON "_accommodations_v" USING btree ("version_published");
  CREATE INDEX "_accommodations_v_version_version_updated_at_idx" ON "_accommodations_v" USING btree ("version_updated_at");
  CREATE INDEX "_accommodations_v_version_version_created_at_idx" ON "_accommodations_v" USING btree ("version_created_at");
  CREATE INDEX "_accommodations_v_version_version__status_idx" ON "_accommodations_v" USING btree ("version__status");
  CREATE INDEX "_accommodations_v_created_at_idx" ON "_accommodations_v" USING btree ("created_at");
  CREATE INDEX "_accommodations_v_updated_at_idx" ON "_accommodations_v" USING btree ("updated_at");
  CREATE INDEX "_accommodations_v_snapshot_idx" ON "_accommodations_v" USING btree ("snapshot");
  CREATE INDEX "_accommodations_v_published_locale_idx" ON "_accommodations_v" USING btree ("published_locale");
  CREATE INDEX "_accommodations_v_latest_idx" ON "_accommodations_v" USING btree ("latest");
  CREATE INDEX "_accommodations_v_autosave_idx" ON "_accommodations_v" USING btree ("autosave");
  CREATE INDEX "_accommodations_v_version_version_slug_idx" ON "_accommodations_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_accommodations_v_locales_locale_parent_id_unique" ON "_accommodations_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "calendar_health_key_idx" ON "calendar_health" USING btree ("key");
  CREATE INDEX "calendar_health_accommodation_idx" ON "calendar_health" USING btree ("accommodation_id");
  CREATE INDEX "calendar_health_updated_at_idx" ON "calendar_health" USING btree ("updated_at");
  CREATE INDEX "calendar_health_created_at_idx" ON "calendar_health" USING btree ("created_at");
  CREATE UNIQUE INDEX "slug_redirects_from_path_idx" ON "slug_redirects" USING btree ("from_path");
  CREATE INDEX "slug_redirects_updated_at_idx" ON "slug_redirects" USING btree ("updated_at");
  CREATE INDEX "slug_redirects_created_at_idx" ON "slug_redirects" USING btree ("created_at");
  CREATE INDEX "site_settings_navigation_order_idx" ON "site_settings_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_parent_id_idx" ON "site_settings_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_navigation_locales_locale_parent_id_unique" ON "site_settings_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_pages_id_idx" ON "site_settings_rels" USING btree ("pages_id");
  CREATE INDEX "site_settings_rels_accommodations_id_idx" ON "site_settings_rels" USING btree ("accommodations_id");
  ALTER TABLE "manual_blocks" ADD CONSTRAINT "manual_blocks_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calendar_health_fk" FOREIGN KEY ("calendar_health_id") REFERENCES "public"."calendar_health"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_slug_redirects_fk" FOREIGN KEY ("slug_redirects_id") REFERENCES "public"."slug_redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accommodations__status_idx" ON "accommodations" USING btree ("_status");
  CREATE UNIQUE INDEX "accommodations_slug_idx" ON "accommodations_locales" USING btree ("slug","_locale");
  CREATE INDEX "manual_blocks_inquiry_idx" ON "manual_blocks" USING btree ("inquiry_id");
  CREATE INDEX "manual_blocks_active_idx" ON "manual_blocks" USING btree ("active");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_calendar_health_id_idx" ON "payload_locked_documents_rels" USING btree ("calendar_health_id");
  CREATE INDEX "payload_locked_documents_rels_slug_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("slug_redirects_id");
  ALTER TABLE "accommodations" DROP COLUMN "slug";
  ALTER TABLE "site_settings_locales" DROP COLUMN "hero_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "hero_text";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "accommodations_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_accommodation_overview" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_accommodation_overview_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_inquiry" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_inquiry_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_accommodation_overview" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_accommodation_overview_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_inquiry" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_inquiry_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_accommodations_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_accommodations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_accommodations_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "calendar_health" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "slug_redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_navigation_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_actions" CASCADE;
  DROP TABLE "pages_blocks_hero_actions_locales" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_rich_text_locales" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_cta_locales" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_content_locales" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq_items_locales" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_faq_locales" CASCADE;
  DROP TABLE "pages_blocks_accommodation_overview" CASCADE;
  DROP TABLE "pages_blocks_accommodation_overview_locales" CASCADE;
  DROP TABLE "pages_blocks_inquiry" CASCADE;
  DROP TABLE "pages_blocks_inquiry_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_actions_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_content_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_accommodation_overview" CASCADE;
  DROP TABLE "_pages_v_blocks_accommodation_overview_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_inquiry" CASCADE;
  DROP TABLE "_pages_v_blocks_inquiry_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "_accommodations_v_version_gallery" CASCADE;
  DROP TABLE "_accommodations_v" CASCADE;
  DROP TABLE "_accommodations_v_locales" CASCADE;
  DROP TABLE "calendar_health" CASCADE;
  DROP TABLE "slug_redirects" CASCADE;
  DROP TABLE "site_settings_navigation" CASCADE;
  DROP TABLE "site_settings_navigation_locales" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  ALTER TABLE "manual_blocks" DROP CONSTRAINT "manual_blocks_inquiry_id_inquiries_id_fk";
  
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_inquiries_status";
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'reviewing', 'offered', 'closed');
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_inquiries_status" USING "status"::"public"."enum_inquiries_status";
  DROP INDEX "accommodations__status_idx";
  DROP INDEX "accommodations_slug_idx";
  DROP INDEX "manual_blocks_inquiry_idx";
  DROP INDEX "manual_blocks_active_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_calendar_health_id_idx";
  DROP INDEX "payload_locked_documents_rels_slug_redirects_id_idx";
  ALTER TABLE "accommodations_gallery" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "accommodations" ALTER COLUMN "sleeps" SET NOT NULL;
  ALTER TABLE "accommodations_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "accommodations_locales" ALTER COLUMN "teaser" SET NOT NULL;
  ALTER TABLE "accommodations" ADD COLUMN "slug" varchar;
  UPDATE "accommodations" SET "slug" = COALESCE((SELECT "slug" FROM "accommodations_locales" WHERE "_parent_id" = "accommodations"."id" AND "_locale" = 'de'), (SELECT "slug" FROM "accommodations_locales" WHERE "_parent_id" = "accommodations"."id" LIMIT 1), 'wohnung-' || "accommodations"."id"::text);
  ALTER TABLE "accommodations" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "site_settings_locales" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "hero_text" varchar;
  ALTER TABLE "accommodations_gallery_locales" ADD CONSTRAINT "accommodations_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accommodations_gallery"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "accommodations_gallery_locales_locale_parent_id_unique" ON "accommodations_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "accommodations_slug_idx" ON "accommodations" USING btree ("slug");
  ALTER TABLE "media_locales" DROP COLUMN "caption";
  ALTER TABLE "accommodations" DROP COLUMN "_status";
  ALTER TABLE "accommodations_locales" DROP COLUMN "slug";
  ALTER TABLE "manual_blocks" DROP COLUMN "inquiry_id";
  ALTER TABLE "manual_blocks" DROP COLUMN "usage";
  ALTER TABLE "manual_blocks" DROP COLUMN "active";
  ALTER TABLE "inquiries" DROP COLUMN "confirm_despite_unknown";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "calendar_health_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "slug_redirects_id";
  DROP TYPE "public"."enum_pages_blocks_hero_actions_link_kind";
  DROP TYPE "public"."enum_pages_blocks_cta_action_kind";
  DROP TYPE "public"."enum_pages_blocks_content_image_side";
  DROP TYPE "public"."enum_pages_blocks_content_action_kind";
  DROP TYPE "public"."enum_pages_blocks_inquiry_mode";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_actions_link_kind";
  DROP TYPE "public"."enum__pages_v_blocks_cta_action_kind";
  DROP TYPE "public"."enum__pages_v_blocks_content_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_content_action_kind";
  DROP TYPE "public"."enum__pages_v_blocks_inquiry_mode";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_accommodations_status";
  DROP TYPE "public"."enum__accommodations_v_version_status";
  DROP TYPE "public"."enum__accommodations_v_published_locale";
  DROP TYPE "public"."enum_manual_blocks_usage";
  DROP TYPE "public"."enum_calendar_health_provider";
  DROP TYPE "public"."enum_slug_redirects_target_collection";
  DROP TYPE "public"."enum_site_settings_navigation_link_kind";`)
}
