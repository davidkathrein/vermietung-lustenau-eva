import * as migration_20260918_135122_initial from './20260918_135122_initial';
import * as migration_20260918_150828_localized_content from './20260918_150828_localized_content';
import * as migration_20260918_175110_final_frontend from './20260918_175110_final_frontend';
import * as migration_20260918_183255_instagram_posts from './20260918_183255_instagram_posts';
import * as migration_20260918_190042_footer_settings from './20260918_190042_footer_settings';
import * as migration_20260918_190319_instagram_sync_status from './20260918_190319_instagram_sync_status';
import * as migration_20260918_201558 from './20260918_201558';

export const migrations = [
  {
    up: migration_20260918_135122_initial.up,
    down: migration_20260918_135122_initial.down,
    name: '20260918_135122_initial',
  },
  {
    up: migration_20260918_150828_localized_content.up,
    down: migration_20260918_150828_localized_content.down,
    name: '20260918_150828_localized_content',
  },
  {
    up: migration_20260918_175110_final_frontend.up,
    down: migration_20260918_175110_final_frontend.down,
    name: '20260918_175110_final_frontend',
  },
  {
    up: migration_20260918_183255_instagram_posts.up,
    down: migration_20260918_183255_instagram_posts.down,
    name: '20260918_183255_instagram_posts',
  },
  {
    up: migration_20260918_190042_footer_settings.up,
    down: migration_20260918_190042_footer_settings.down,
    name: '20260918_190042_footer_settings',
  },
  {
    up: migration_20260918_190319_instagram_sync_status.up,
    down: migration_20260918_190319_instagram_sync_status.down,
    name: '20260918_190319_instagram_sync_status',
  },
  {
    up: migration_20260918_201558.up,
    down: migration_20260918_201558.down,
    name: '20260918_201558'
  },
];
