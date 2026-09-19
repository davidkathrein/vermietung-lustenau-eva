import * as migration_20260918_140414_initial from './20260918_140414_initial';
import * as migration_20260918_150858_localized_content from './20260918_150858_localized_content';
import * as migration_20260918_175221_final_frontend from './20260918_175221_final_frontend';
import * as migration_20260918_183302_instagram_posts from './20260918_183302_instagram_posts';
import * as migration_20260918_190143_footer_settings from './20260918_190143_footer_settings';
import * as migration_20260918_190325_instagram_sync_status from './20260918_190325_instagram_sync_status';
import * as migration_20260918_201700_instagram_source_profile from './20260918_201700_instagram_source_profile';

export const migrations = [
  {
    up: migration_20260918_140414_initial.up,
    down: migration_20260918_140414_initial.down,
    name: '20260918_140414_initial',
  },
  {
    up: migration_20260918_150858_localized_content.up,
    down: migration_20260918_150858_localized_content.down,
    name: '20260918_150858_localized_content',
  },
  {
    up: migration_20260918_175221_final_frontend.up,
    down: migration_20260918_175221_final_frontend.down,
    name: '20260918_175221_final_frontend',
  },
  {
    up: migration_20260918_183302_instagram_posts.up,
    down: migration_20260918_183302_instagram_posts.down,
    name: '20260918_183302_instagram_posts',
  },
  {
    up: migration_20260918_190143_footer_settings.up,
    down: migration_20260918_190143_footer_settings.down,
    name: '20260918_190143_footer_settings',
  },
  {
    up: migration_20260918_190325_instagram_sync_status.up,
    down: migration_20260918_190325_instagram_sync_status.down,
    name: '20260918_190325_instagram_sync_status'
  },
  {
    up: migration_20260918_201700_instagram_source_profile.up,
    down: migration_20260918_201700_instagram_source_profile.down,
    name: '20260918_201700_instagram_source_profile',
  },
];
