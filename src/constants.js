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

// drawing colors
export const pathAlpha = 0.25;
export const pathColor = 0x00ff00;
export const ntAlpha = 0.4;
export const ntColor = 0xff8c00;

// tagpro physics
const maxSpeed = 2.5; // meters per second
const acceleration = 0.025; // meters per frame
export const tilesPerMeter = 2.5;
const framesPerSecond = 60;
// export in tiles per second
export const accelTilesPerSecond = acceleration * framesPerSecond * tilesPerMeter;
export const maxSpeedTilesPerSecond = maxSpeed * tilesPerMeter;
export const timeStep = 0.5; // second

export const directions = [
  // hold left, and up, nothing, down
  { x: -1, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  // hold nothing, and up, nothing, down
  { x: 0, y: -1 },
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  // hold right, and up, nothing, down
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
];
