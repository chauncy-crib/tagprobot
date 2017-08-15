import { assert } from '../src/utils/asserts';

export const teams = {
  RED: 1,
  BLUE: 2,
};

// Pixels per tile length
export const PPTL = 40;

// Cells per tile length
export const CPTL = 1;
assert(PPTL % CPTL === 0, 'CPTL does not divide evenly into PPTL');

// Pixels per cell length
export const PPCL = PPTL / CPTL;

export const pathAlpha = 0.25;
export const pathColor = 0x00ff00;
export const ntAlpha = 0.4;
export const ntColor = 0xff8c00;
