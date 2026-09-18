import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_actions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_kind\` text DEFAULT 'internal',
  	\`link_url\` text,
  	\`link_email\` text,
  	\`link_phone\` text,
  	\`link_anchor\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_actions_order_idx\` ON \`pages_blocks_hero_actions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_actions_parent_id_idx\` ON \`pages_blocks_hero_actions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_actions_locales\` (
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero_actions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_hero_actions_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_actions_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_idx\` ON \`pages_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_hero_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_order_idx\` ON \`pages_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_parent_id_idx\` ON \`pages_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_path_idx\` ON \`pages_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text_locales\` (
  	\`headline\` text,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_rich_text_locales_locale_parent_id_unique\` ON \`pages_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`action_kind\` text DEFAULT 'internal',
  	\`action_url\` text,
  	\`action_email\` text,
  	\`action_phone\` text,
  	\`action_anchor\` text,
  	\`action_new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`action_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cta_locales_locale_parent_id_unique\` ON \`pages_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_side\` text DEFAULT 'right',
  	\`action_kind\` text DEFAULT 'internal',
  	\`action_url\` text,
  	\`action_email\` text,
  	\`action_phone\` text,
  	\`action_anchor\` text,
  	\`action_new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_order_idx\` ON \`pages_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_parent_id_idx\` ON \`pages_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_path_idx\` ON \`pages_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_image_idx\` ON \`pages_blocks_content\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`body\` text,
  	\`action_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_content_locales_locale_parent_id_unique\` ON \`pages_blocks_content_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_order_idx\` ON \`pages_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_parent_id_idx\` ON \`pages_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_faq_items_locales_locale_parent_id_unique\` ON \`pages_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_order_idx\` ON \`pages_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_parent_id_idx\` ON \`pages_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_path_idx\` ON \`pages_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_faq_locales_locale_parent_id_unique\` ON \`pages_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_accommodation_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_accommodation_overview_order_idx\` ON \`pages_blocks_accommodation_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_accommodation_overview_parent_id_idx\` ON \`pages_blocks_accommodation_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_accommodation_overview_path_idx\` ON \`pages_blocks_accommodation_overview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_accommodation_overview_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_accommodation_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_accommodation_overview_locales_locale_parent_id\` ON \`pages_blocks_accommodation_overview_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_inquiry\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`mode\` text DEFAULT 'both',
  	\`accommodation_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`accommodation_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_inquiry_order_idx\` ON \`pages_blocks_inquiry\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_inquiry_parent_id_idx\` ON \`pages_blocks_inquiry\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_inquiry_path_idx\` ON \`pages_blocks_inquiry\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_inquiry_accommodation_idx\` ON \`pages_blocks_inquiry\` (\`accommodation_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_inquiry_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_inquiry\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_inquiry_locales_locale_parent_id_unique\` ON \`pages_blocks_inquiry_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`internal_name\` text,
  	\`seo_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_internal_name_idx\` ON \`pages\` (\`internal_name\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_image_idx\` ON \`pages\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`slug\` text,
  	\`title\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`accommodations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_pages_id_idx\` ON \`pages_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_accommodations_id_idx\` ON \`pages_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_actions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_kind\` text DEFAULT 'internal',
  	\`link_url\` text,
  	\`link_email\` text,
  	\`link_phone\` text,
  	\`link_anchor\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_actions_order_idx\` ON \`_pages_v_blocks_hero_actions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_actions_parent_id_idx\` ON \`_pages_v_blocks_hero_actions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_actions_locales\` (
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero_actions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_actions_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_actions_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_image_idx\` ON \`_pages_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_order_idx\` ON \`_pages_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_parent_id_idx\` ON \`_pages_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_path_idx\` ON \`_pages_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_rich_text_locales\` (
  	\`headline\` text,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_rich_text_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`action_kind\` text DEFAULT 'internal',
  	\`action_url\` text,
  	\`action_email\` text,
  	\`action_phone\` text,
  	\`action_anchor\` text,
  	\`action_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`action_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cta_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_side\` text DEFAULT 'right',
  	\`action_kind\` text DEFAULT 'internal',
  	\`action_url\` text,
  	\`action_email\` text,
  	\`action_phone\` text,
  	\`action_anchor\` text,
  	\`action_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_order_idx\` ON \`_pages_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_parent_id_idx\` ON \`_pages_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_path_idx\` ON \`_pages_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_image_idx\` ON \`_pages_v_blocks_content\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`body\` text,
  	\`action_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_content_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_content_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_order_idx\` ON \`_pages_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_parent_id_idx\` ON \`_pages_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_faq_items_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_order_idx\` ON \`_pages_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_parent_id_idx\` ON \`_pages_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_path_idx\` ON \`_pages_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_faq_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_accommodation_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accommodation_overview_order_idx\` ON \`_pages_v_blocks_accommodation_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accommodation_overview_parent_id_idx\` ON \`_pages_v_blocks_accommodation_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accommodation_overview_path_idx\` ON \`_pages_v_blocks_accommodation_overview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_accommodation_overview_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_accommodation_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_accommodation_overview_locales_locale_parent\` ON \`_pages_v_blocks_accommodation_overview_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_inquiry\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`mode\` text DEFAULT 'both',
  	\`accommodation_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`accommodation_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_inquiry_order_idx\` ON \`_pages_v_blocks_inquiry\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_inquiry_parent_id_idx\` ON \`_pages_v_blocks_inquiry\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_inquiry_path_idx\` ON \`_pages_v_blocks_inquiry\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_inquiry_accommodation_idx\` ON \`_pages_v_blocks_inquiry\` (\`accommodation_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_inquiry_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_inquiry\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_inquiry_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_inquiry_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_internal_name\` text,
  	\`version_seo_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_internal_name_idx\` ON \`_pages_v\` (\`version_internal_name\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_version_seo_image_idx\` ON \`_pages_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_slug\` text,
  	\`version_title\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`accommodations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_pages_id_idx\` ON \`_pages_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_accommodations_id_idx\` ON \`_pages_v_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE TABLE \`_accommodations_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_accommodations_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_gallery_order_idx\` ON \`_accommodations_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_gallery_parent_id_idx\` ON \`_accommodations_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_gallery_image_idx\` ON \`_accommodations_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_accommodations_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_sleeps\` numeric,
  	\`version_size_sqm\` numeric,
  	\`version_seminar_capable\` integer DEFAULT false,
  	\`version_seminar_capacity\` numeric,
  	\`version_floorplan_id\` integer,
  	\`version_ical_airbnb\` text,
  	\`version_ical_booking\` text,
  	\`version_sort_order\` numeric DEFAULT 0,
  	\`version_published\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_floorplan_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_accommodations_v_parent_idx\` ON \`_accommodations_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version_floorplan_idx\` ON \`_accommodations_v\` (\`version_floorplan_id\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version_published_idx\` ON \`_accommodations_v\` (\`version_published\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version_updated_at_idx\` ON \`_accommodations_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version_created_at_idx\` ON \`_accommodations_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version__status_idx\` ON \`_accommodations_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_created_at_idx\` ON \`_accommodations_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_updated_at_idx\` ON \`_accommodations_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_snapshot_idx\` ON \`_accommodations_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_published_locale_idx\` ON \`_accommodations_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_latest_idx\` ON \`_accommodations_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_accommodations_v_autosave_idx\` ON \`_accommodations_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_accommodations_v_locales\` (
  	\`version_slug\` text,
  	\`version_name\` text,
  	\`version_teaser\` text,
  	\`version_description\` text,
  	\`version_bed_setup\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_accommodations_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_accommodations_v_version_version_slug_idx\` ON \`_accommodations_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_accommodations_v_locales_locale_parent_id_unique\` ON \`_accommodations_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`calendar_health\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`accommodation_id\` integer NOT NULL,
  	\`provider\` text NOT NULL,
  	\`consecutive_failures\` numeric DEFAULT 0 NOT NULL,
  	\`last_success_at\` text,
  	\`last_failure_at\` text,
  	\`alerted_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`accommodation_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`calendar_health_key_idx\` ON \`calendar_health\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`calendar_health_accommodation_idx\` ON \`calendar_health\` (\`accommodation_id\`);`)
  await db.run(sql`CREATE INDEX \`calendar_health_updated_at_idx\` ON \`calendar_health\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`calendar_health_created_at_idx\` ON \`calendar_health\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`slug_redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from_path\` text NOT NULL,
  	\`target_collection\` text NOT NULL,
  	\`target_id\` numeric NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`slug_redirects_from_path_idx\` ON \`slug_redirects\` (\`from_path\`);`)
  await db.run(sql`CREATE INDEX \`slug_redirects_updated_at_idx\` ON \`slug_redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`slug_redirects_created_at_idx\` ON \`slug_redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_navigation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_kind\` text DEFAULT 'internal' NOT NULL,
  	\`link_url\` text,
  	\`link_email\` text,
  	\`link_phone\` text,
  	\`link_anchor\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_order_idx\` ON \`site_settings_navigation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_parent_id_idx\` ON \`site_settings_navigation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_navigation_locales\` (
  	\`link_label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_navigation_locales_locale_parent_id_unique\` ON \`site_settings_navigation_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`accommodations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_rels_order_idx\` ON \`site_settings_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_parent_idx\` ON \`site_settings_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_path_idx\` ON \`site_settings_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_pages_id_idx\` ON \`site_settings_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_accommodations_id_idx\` ON \`site_settings_rels\` (\`accommodations_id\`);`)
  await db.run(sql`DROP TABLE \`accommodations_gallery_locales\`;`)
  await db.run(sql`ALTER TABLE \`accommodations_locales\` ADD \`slug\` text;`)
  await db.run(sql`UPDATE \`accommodations_locales\` SET \`slug\` = (SELECT \`slug\` FROM \`accommodations\` WHERE \`accommodations\`.\`id\` = \`accommodations_locales\`.\`_parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_accommodations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`sleeps\` numeric,
  	\`size_sqm\` numeric,
  	\`seminar_capable\` integer DEFAULT false,
  	\`seminar_capacity\` numeric,
  	\`floorplan_id\` integer,
  	\`ical_airbnb\` text,
  	\`ical_booking\` text,
  	\`sort_order\` numeric DEFAULT 0,
  	\`published\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`floorplan_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations\`("id", "sleeps", "size_sqm", "seminar_capable", "seminar_capacity", "floorplan_id", "ical_airbnb", "ical_booking", "sort_order", "published", "updated_at", "created_at", "_status") SELECT "id", "sleeps", "size_sqm", "seminar_capable", "seminar_capacity", "floorplan_id", "ical_airbnb", "ical_booking", "sort_order", "published", "updated_at", "created_at", 'draft' FROM \`accommodations\`;`)
  await db.run(sql`DROP TABLE \`accommodations\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations\` RENAME TO \`accommodations\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`accommodations_floorplan_idx\` ON \`accommodations\` (\`floorplan_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_published_idx\` ON \`accommodations\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_updated_at_idx\` ON \`accommodations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_created_at_idx\` ON \`accommodations\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`accommodations__status_idx\` ON \`accommodations\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_gallery\`("_order", "_parent_id", "id", "image_id") SELECT "_order", "_parent_id", "id", "image_id" FROM \`accommodations_gallery\`;`)
  await db.run(sql`DROP TABLE \`accommodations_gallery\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_gallery\` RENAME TO \`accommodations_gallery\`;`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_order_idx\` ON \`accommodations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_parent_id_idx\` ON \`accommodations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_image_idx\` ON \`accommodations_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_locales\` (
  	\`slug\` text,
  	\`name\` text,
  	\`teaser\` text,
  	\`description\` text,
  	\`bed_setup\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_locales\`("slug", "name", "teaser", "description", "bed_setup", "id", "_locale", "_parent_id") SELECT "slug", "name", "teaser", "description", "bed_setup", "id", "_locale", "_parent_id" FROM \`accommodations_locales\`;`)
  await db.run(sql`DROP TABLE \`accommodations_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_locales\` RENAME TO \`accommodations_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_slug_idx\` ON \`accommodations_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_locales_locale_parent_id_unique\` ON \`accommodations_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`media_locales\` ADD \`caption\` text;`)
  await db.run(sql`ALTER TABLE \`manual_blocks\` ADD \`inquiry_id\` integer REFERENCES inquiries(id);`)
  await db.run(sql`ALTER TABLE \`manual_blocks\` ADD \`usage\` text DEFAULT 'manual';`)
  await db.run(sql`ALTER TABLE \`manual_blocks\` ADD \`active\` integer DEFAULT true;`)
  await db.run(sql`CREATE INDEX \`manual_blocks_inquiry_idx\` ON \`manual_blocks\` (\`inquiry_id\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_active_idx\` ON \`manual_blocks\` (\`active\`);`)
  await db.run(sql`ALTER TABLE \`inquiries\` ADD \`confirm_despite_unknown\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pages_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`calendar_health_id\` integer REFERENCES calendar_health(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`slug_redirects_id\` integer REFERENCES slug_redirects(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_calendar_health_id_idx\` ON \`payload_locked_documents_rels\` (\`calendar_health_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_slug_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`slug_redirects_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`hero_title\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`hero_text\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP INDEX \`accommodations_slug_idx\`;`)
  await db.run(sql`CREATE TABLE \`accommodations_gallery_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_gallery_locales_locale_parent_id_unique\` ON \`accommodations_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_actions\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_actions_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_accommodation_overview\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_accommodation_overview_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_inquiry\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_inquiry_locales\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_actions\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_actions_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_accommodation_overview\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_accommodation_overview_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_inquiry\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_inquiry_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_accommodations_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_accommodations_v\`;`)
  await db.run(sql`DROP TABLE \`_accommodations_v_locales\`;`)
  await db.run(sql`DROP TABLE \`calendar_health\`;`)
  await db.run(sql`DROP TABLE \`slug_redirects\`;`)
  await db.run(sql`DROP TABLE \`site_settings_navigation\`;`)
  await db.run(sql`DROP TABLE \`site_settings_navigation_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_manual_blocks\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`accommodation_id\` integer NOT NULL,
  	\`start_date\` text NOT NULL,
  	\`end_date\` text NOT NULL,
  	\`reason\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`accommodation_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_manual_blocks\`("id", "accommodation_id", "start_date", "end_date", "reason", "updated_at", "created_at") SELECT "id", "accommodation_id", "start_date", "end_date", "reason", "updated_at", "created_at" FROM \`manual_blocks\`;`)
  await db.run(sql`DROP TABLE \`manual_blocks\`;`)
  await db.run(sql`ALTER TABLE \`__new_manual_blocks\` RENAME TO \`manual_blocks\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`manual_blocks_accommodation_idx\` ON \`manual_blocks\` (\`accommodation_id\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_start_date_idx\` ON \`manual_blocks\` (\`start_date\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_end_date_idx\` ON \`manual_blocks\` (\`end_date\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_updated_at_idx\` ON \`manual_blocks\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_created_at_idx\` ON \`manual_blocks\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`accommodations_id\` integer,
  	\`manual_blocks_id\` integer,
  	\`inquiries_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`manual_blocks_id\`) REFERENCES \`manual_blocks\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "accommodations_id", "manual_blocks_id", "inquiries_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "accommodations_id", "manual_blocks_id", "inquiries_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accommodations_id_idx\` ON \`payload_locked_documents_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_manual_blocks_id_idx\` ON \`payload_locked_documents_rels\` (\`manual_blocks_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`sleeps\` numeric NOT NULL,
  	\`size_sqm\` numeric,
  	\`seminar_capable\` integer DEFAULT false,
  	\`seminar_capacity\` numeric,
  	\`floorplan_id\` integer,
  	\`ical_airbnb\` text,
  	\`ical_booking\` text,
  	\`sort_order\` numeric DEFAULT 0,
  	\`published\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`floorplan_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations\`("id", "slug", "sleeps", "size_sqm", "seminar_capable", "seminar_capacity", "floorplan_id", "ical_airbnb", "ical_booking", "sort_order", "published", "updated_at", "created_at") SELECT "id", COALESCE((SELECT "slug" FROM "accommodations_locales" WHERE "_parent_id" = "accommodations"."id" AND "_locale" = 'de'), (SELECT "slug" FROM "accommodations_locales" WHERE "_parent_id" = "accommodations"."id" LIMIT 1), 'wohnung-' || "id"), COALESCE("sleeps", 1), "size_sqm", "seminar_capable", "seminar_capacity", "floorplan_id", "ical_airbnb", "ical_booking", "sort_order", "published", "updated_at", "created_at" FROM \`accommodations\`;`)
  await db.run(sql`DROP TABLE \`accommodations\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations\` RENAME TO \`accommodations\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_slug_idx\` ON \`accommodations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_floorplan_idx\` ON \`accommodations\` (\`floorplan_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_published_idx\` ON \`accommodations\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_updated_at_idx\` ON \`accommodations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_created_at_idx\` ON \`accommodations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_locales\` (
  	\`name\` text NOT NULL,
  	\`teaser\` text NOT NULL,
  	\`description\` text,
  	\`bed_setup\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_locales\`("name", "teaser", "description", "bed_setup", "id", "_locale", "_parent_id") SELECT "name", "teaser", "description", "bed_setup", "id", "_locale", "_parent_id" FROM \`accommodations_locales\`;`)
  await db.run(sql`DROP TABLE \`accommodations_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_locales\` RENAME TO \`accommodations_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_locales_locale_parent_id_unique\` ON \`accommodations_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_accommodations_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_accommodations_gallery\`("_order", "_parent_id", "id", "image_id") SELECT "_order", "_parent_id", "id", "image_id" FROM \`accommodations_gallery\`;`)
  await db.run(sql`DROP TABLE \`accommodations_gallery\`;`)
  await db.run(sql`ALTER TABLE \`__new_accommodations_gallery\` RENAME TO \`accommodations_gallery\`;`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_order_idx\` ON \`accommodations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_parent_id_idx\` ON \`accommodations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_image_idx\` ON \`accommodations_gallery\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`hero_text\` text;`)
  await db.run(sql`ALTER TABLE \`media_locales\` DROP COLUMN \`caption\`;`)
  await db.run(sql`ALTER TABLE \`inquiries\` DROP COLUMN \`confirm_despite_unknown\`;`)
}
