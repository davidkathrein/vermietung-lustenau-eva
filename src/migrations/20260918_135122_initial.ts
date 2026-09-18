import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`created_at\` text,
    \`expires_at\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`email\` text NOT NULL,
    \`reset_password_token\` text,
    \`reset_password_expiration\` text,
    \`salt\` text,
    \`hash\` text,
    \`login_attempts\` numeric DEFAULT 0,
    \`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`alt\` text NOT NULL,
    \`prefix\` text DEFAULT '',
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`url\` text,
    \`thumbnail_u_r_l\` text,
    \`filename\` text,
    \`mime_type\` text,
    \`filesize\` numeric,
    \`width\` numeric,
    \`height\` numeric,
    \`focal_x\` numeric,
    \`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_gallery\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`image_id\` integer NOT NULL,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_order_idx\` ON \`accommodations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_parent_id_idx\` ON \`accommodations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_gallery_image_idx\` ON \`accommodations_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_gallery_locales\` (
    \`caption\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`accommodations_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_gallery_locales_locale_parent_id_unique\` ON \`accommodations_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`accommodations\` (
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
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_slug_idx\` ON \`accommodations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_floorplan_idx\` ON \`accommodations\` (\`floorplan_id\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_published_idx\` ON \`accommodations\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_updated_at_idx\` ON \`accommodations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`accommodations_created_at_idx\` ON \`accommodations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`accommodations_locales\` (
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
  await db.run(sql`CREATE UNIQUE INDEX \`accommodations_locales_locale_parent_id_unique\` ON \`accommodations_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`manual_blocks\` (
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
  await db.run(sql`CREATE INDEX \`manual_blocks_accommodation_idx\` ON \`manual_blocks\` (\`accommodation_id\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_start_date_idx\` ON \`manual_blocks\` (\`start_date\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_end_date_idx\` ON \`manual_blocks\` (\`end_date\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_updated_at_idx\` ON \`manual_blocks\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`manual_blocks_created_at_idx\` ON \`manual_blocks\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`inquiries\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`kind\` text NOT NULL,
    \`arrival\` text NOT NULL,
    \`departure\` text,
    \`name\` text NOT NULL,
    \`email\` text NOT NULL,
    \`phone\` text,
    \`guests\` numeric,
    \`message\` text,
    \`status\` text DEFAULT 'new' NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`inquiries_updated_at_idx\` ON \`inquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_created_at_idx\` ON \`inquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`inquiries_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`accommodations_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`accommodations_id\`) REFERENCES \`accommodations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`inquiries_rels_order_idx\` ON \`inquiries_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_rels_parent_idx\` ON \`inquiries_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_rels_path_idx\` ON \`inquiries_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_rels_accommodations_id_idx\` ON \`inquiries_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`key\` text NOT NULL,
    \`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`global_slug\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accommodations_id_idx\` ON \`payload_locked_documents_rels\` (\`accommodations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_manual_blocks_id_idx\` ON \`payload_locked_documents_rels\` (\`manual_blocks_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`key\` text,
    \`value\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`users_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text,
    \`batch\` numeric,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`operator_name\` text,
    \`contact_email\` text,
    \`contact_phone\` text,
    \`street_address\` text,
    \`postal_code\` text,
    \`city\` text,
    \`country\` text,
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
    \`site_name\` text,
    \`hero_title\` text,
    \`hero_text\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`accommodations_gallery\`;`)
  await db.run(sql`DROP TABLE \`accommodations_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`accommodations\`;`)
  await db.run(sql`DROP TABLE \`accommodations_locales\`;`)
  await db.run(sql`DROP TABLE \`manual_blocks\`;`)
  await db.run(sql`DROP TABLE \`inquiries\`;`)
  await db.run(sql`DROP TABLE \`inquiries_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
}
