import { assert } from '../src/utils/asserts';


export const tileTypes = {
  EMPTY_SPACE: 0,
  SQUARE_WALL: 1,
  ANGLE_WALL_1: 1.1,
  ANGLE_WALL_2: 1.2,
  ANGLE_WALL_3: 1.3,
  ANGLE_WALL_4: 1.4,
  REGULAR_FLOOR: 2,
  RED_FLAG: 3,
  RED_FLAG_TAKEN: 3.1,
  BLUE_FLAG: 4,
  BLUE_FLAG_TAKEN: 4.1,
  SPEEDPAD_ACTIVE: 5,
  SPEEDPAD_INACTIVE: '5.1',
  POWERUP_SUBGROUP: 6,
  JUKEJUICE: 6.1,
  ROLLING_BOMB: 6.2,
  TAGPRO: 6.3,
  MAX_SPEED: 6.4,
  SPIKE: 7,
  BUTTON: 8,
  INACTIVE_GATE: 9,
  GREEN_GATE: 9.1,
  RED_GATE: 9.2,
  BLUE_GATE: 9.3,
  BOMB: 10,
  INACTIVE_BOMB: '10.1',
  RED_TEAMTILE: 11,
  BLUE_TEAMTILE: 12,
  ACTIVE_PORTAL: 13,
  INACTIVE_PORTAL: '13.1',
  SPEEDPAD_RED_ACTIVE: 14,
  SPEEDPAD_RED_INACTIVE: 14.1,
  SPEEDPAD_BLUE_ACTIVE: 15,
  SPEEDPAD_BLUE_INACTIVE: 15.1,
  YELLOW_FLAG: 16,
  YELLOW_FLAG_TAKEN: '16.1',
  RED_ENDZONE: 17,
  BLUE_ENDZONE: 18,
};

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
