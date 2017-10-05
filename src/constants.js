import { getNTKernel } from './helpers/constants';
import { assert } from '../src/utils/asserts';


export const teams = {
  RED: 1,
  BLUE: 2,
};

// Pixels per tile length
export const PPTL = 40;

// Cells per tile length
export const CPTL = 2;
assert(PPTL % CPTL === 0, 'CPTL does not divide evenly into PPTL');

// Pixels per cell length
export const PPCL = PPTL / CPTL;

// Size of the Tagpro ball
export const BRP = 19; // ball radius, in pixels

// Nontraversable kernel, which applies a buffer around NTOs on the map
export const NTKernel = getNTKernel();

export const pathAlpha = 0.25;
export const pathColor = 0x00ff00;
export const ntAlpha = 0.4;
export const ntColor = 0xff8c00;
export const keyColor = 0x753daf; // purple
export const keyOnAlpha = 0.75;
export const keyOffAlpha = 0.2;
