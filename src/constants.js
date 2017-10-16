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

// Drawing constants
export const pathAlpha = 0.25;
export const pathColor = 0x00ff00; // Green
export const ntAlpha = 0.4;
export const ntColor = 0xff8c00; // Orange
export const keyColor = 0x753daf; // purple
export const keyOnAlpha = 0.75;
export const keyOffAlpha = 0.2;
export const navMeshColor = 0x9400ff; // Purple
export const navMeshThickness = 4; // Line thickness in pixels

// Tagpro physics
const maxSpeedMPS = 2.5; // meters per second
const accelerationMPF = 0.025; // meters per frame
const tilesPerMeter = 2.5;
const framesPerSecond = 60;

// export all constants in pixels per second
// accel = 3.75 tiles/second^2 = 150 pixels/second^2
export const accel = accelerationMPF * framesPerSecond * tilesPerMeter * PPTL;
// maxSpeed = 6.25 tiles/second = 250 pixels/second^2
export const maxSpeed = maxSpeedMPS * tilesPerMeter * PPTL;
// Every frame, current velocity is multiplied by (1 - step * damp) = (1 - (1/60) * 0.5) = 0.992
export const dampingFactor = 0.5;
