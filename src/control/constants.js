import { PPTL } from '../global/constants';


// Tagpro physics
const maxSpeedMPS = 2.5; // meters per second
const accelerationMPF = 0.025; // meters per frame
const tilesPerMeter = 2.5;

export const FPS = 60; // frames per second

// Export all constants in units of pixels and seconds
// ACCEL = 3.75 tiles/second^2 = 150 pixels/second^2
export const ACCEL = accelerationMPF * FPS * tilesPerMeter * PPTL;
// MAX_SPEED = 6.25 tiles/second = 250 pixels/second
export const MAX_SPEED = maxSpeedMPS * tilesPerMeter * PPTL;
// Every frame, current velocity is multiplied by (1 - step * damp) = (1 - (1/60) * 0.5) = 0.992
export const DAMPING_FACTOR = 0.5;
