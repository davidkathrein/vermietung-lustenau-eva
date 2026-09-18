import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`country\` text;`)
  await db.run(sql`INSERT INTO \`media_locales\` (\`alt\`, \`_locale\`, \`_parent_id\`)
    SELECT \`alt\`, 'de', \`id\` FROM \`media\`;`)
  await db.run(sql`UPDATE \`site_settings_locales\` SET \`country\` =
    (SELECT \`country\` FROM \`site_settings\` WHERE \`site_settings\`.\`id\` = \`site_settings_locales\`.\`_parent_id\`)
    WHERE \`_locale\` = 'de';`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`country\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`alt\` text NOT NULL DEFAULT '';`)
  await db.run(sql`UPDATE \`media\` SET \`alt\` = COALESCE(
    (SELECT \`alt\` FROM \`media_locales\` WHERE \`_parent_id\` = \`media\`.\`id\` AND \`_locale\` = 'de'),
    (SELECT \`alt\` FROM \`media_locales\` WHERE \`_parent_id\` = \`media\`.\`id\` LIMIT 1), '');`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`country\` text;`)
  await db.run(sql`UPDATE \`site_settings\` SET \`country\` =
    (SELECT \`country\` FROM \`site_settings_locales\` WHERE \`_parent_id\` = \`site_settings\`.\`id\` AND \`_locale\` = 'de');`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`country\`;`)
}
