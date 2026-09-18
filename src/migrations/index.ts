import * as migration_20260918_135122_initial from './20260918_135122_initial';

export const migrations = [
  {
    up: migration_20260918_135122_initial.up,
    down: migration_20260918_135122_initial.down,
    name: '20260918_135122_initial'
  },
];
