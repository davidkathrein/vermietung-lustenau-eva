import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings_footer_links\` (
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
  await db.run(sql`CREATE INDEX \`site_settings_footer_links_order_idx\` ON \`site_settings_footer_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_links_parent_id_idx\` ON \`site_settings_footer_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_footer_links_locales\` (
    \`link_label\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_footer_links_locales_locale_parent_id_unique\` ON \`site_settings_footer_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_title\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_description\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_apartments_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_links_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_contact_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_copyright_text\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings_footer_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_links_locales\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_title\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_description\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_apartments_heading\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_links_heading\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_contact_heading\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`footer_copyright_text\`;`)
}
