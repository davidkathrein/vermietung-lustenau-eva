import * as migration_20260918_135122_initial from './20260918_135122_initial';
import * as migration_20260918_150828_localized_content from './20260918_150828_localized_content';
import * as migration_20260918_175110_final_frontend from './20260918_175110_final_frontend';

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
    name: '20260918_175110_final_frontend'
  },
];
