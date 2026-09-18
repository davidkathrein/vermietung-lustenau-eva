import * as migration_20260918_140414_initial from './20260918_140414_initial';
import * as migration_20260918_150858_localized_content from './20260918_150858_localized_content';
import * as migration_20260918_175221_final_frontend from './20260918_175221_final_frontend';

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
    name: '20260918_175221_final_frontend'
  },
];
