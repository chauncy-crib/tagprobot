import { PPTL } from '../global/constants';


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
