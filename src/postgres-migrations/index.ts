import * as migration_20260918_140414_initial from './20260918_140414_initial';

export const migrations = [
  {
    up: migration_20260918_140414_initial.up,
    down: migration_20260918_140414_initial.down,
    name: '20260918_140414_initial'
  },
];
