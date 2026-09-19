import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_instagram_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_feed_order_idx\` ON \`pages_blocks_instagram_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_feed_parent_id_idx\` ON \`pages_blocks_instagram_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_feed_path_idx\` ON \`pages_blocks_instagram_feed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_instagram_feed_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_instagram_feed\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_instagram_feed_locales_locale_parent_id_unique\` ON \`pages_blocks_instagram_feed_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_instagram_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_feed_order_idx\` ON \`_pages_v_blocks_instagram_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_feed_parent_id_idx\` ON \`_pages_v_blocks_instagram_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_feed_path_idx\` ON \`_pages_v_blocks_instagram_feed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_instagram_feed_locales\` (
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`intro\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_instagram_feed\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_instagram_feed_locales_locale_parent_id_uniq\` ON \`_pages_v_blocks_instagram_feed_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_instagram_feed_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_instagram_feed\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_instagram_feed_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_instagram_feed\`;`)
}
