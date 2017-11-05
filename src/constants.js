import { getNTKernel } from './helpers/constants';
import { assert } from '../src/utils/asserts';


export const TEAMS = {
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

// use diagonals in A* calculation
export const DIAGONAL = true;

// Nontraversable kernel, which applies a buffer around NTOs on the map
export const NT_KERNEL = getNTKernel();

// Drawing constants
export const PATH_ALPHA = 0.25;
export const PATH_COLOR = 0x00ff00; // Green
export const NT_ALPHA = 0.4;
export const NT_COLOR = 0xff8c00; // Orange
export const KEY_COLOR = 0x753daf; // Purple
export const KEY_ON_ALPHA = 0.75;
export const KEY_OFF_ALPHA = 0.2;
export const NAV_MESH_EDGE_COLOR = 0xff0090; // Pink
export const NAV_MESH_VERTEX_COLOR = 0xa5005d; // Darker Pink
export const NAV_MESH_ALPHA = 0.2;
export const NAV_MESH_THICKNESS = 4; // Line thickness in pixels

// Numbers of cells along the shortest path to lookeahead and seek toward
export const LOOKAHEAD = 3;

// Tagpro physics
const maxSpeedMPS = 2.5; // meters per second
const accelerationMPF = 0.025; // meters per frame
const tilesPerMeter = 2.5;
const framesPerSecond = 60;

// Export all constants in pixels per second
// ACCEL = 3.75 tiles/second^2 = 150 pixels/second^2
export const ACCEL = accelerationMPF * framesPerSecond * tilesPerMeter * PPTL;
// MAX_SPEED = 6.25 tiles/second = 250 pixels/second^2
export const MAX_SPEED = maxSpeedMPS * tilesPerMeter * PPTL;
// Every frame, current velocity is multiplied by (1 - step * damp) = (1 - (1/60) * 0.5) = 0.992
export const DAMPING_FACTOR = 0.5;
