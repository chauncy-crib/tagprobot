import keys from 'lodash/keys';
import includes from 'lodash/includes';
import isUndefined from 'lodash/isUndefined';
import { assert } from './utils/asserts';
import { amBlue, amRed } from './helpers/player';

let tileInfo;
let tileNames;

export function computeTileInfo() {
  tileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false },
    SQUARE_WALL: { id: 1, traversable: false },
    ANGLE_WALL_1: { id: 1.1, traversable: false },
    ANGLE_WALL_2: { id: 1.2, traversable: false },
    ANGLE_WALL_3: { id: 1.3, traversable: false },
    ANGLE_WALL_4: { id: 1.4, traversable: false },
    REGULAR_FLOOR: { id: 2, traversable: true },
    RED_FLAG: { id: 3, traversable: amRed() },
    RED_FLAG_TAKEN: { id: 3.1, traversable: true },
    BLUE_FLAG: { id: 4, traversable: amBlue() },
    BLUE_FLAG_TAKEN: { id: 4.1, traversable: true },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15 },
    SPEEDPAD_INACTIVE: { id: '5.1', traversable: true },
    POWERUP_SUBGROUP: { id: 6, traversable: false, radius: 15 },
    JUKEJUICE: { id: 6.1, traversable: false, radius: 15 },
    ROLLING_BOMB: { id: 6.2, traversable: false, radius: 15 },
    TAGPRO: { id: 6.3, traversable: false, radius: 15 },
    MAX_SPEED: { id: 6.4, traversable: false, radius: 15 },
    SPIKE: { id: 7, traversable: false, radius: 14 },
    BUTTON: { id: 8, traversable: false, radius: 8 },
    INACTIVE_GATE: { id: 9, traversable: true },
    GREEN_GATE: { id: 9.1, traversable: false },
    RED_GATE: { id: 9.2, traversable: amRed() },
    BLUE_GATE: { id: 9.3, traversable: amBlue() },
    BOMB: { id: 10, traversable: false, radius: 15 },
    INACTIVE_BOMB: { id: '10.1', traversable: true },
    RED_TEAMTILE: { id: 11, traversable: true },
    BLUE_TEAMTILE: { id: 12, traversable: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15 },
    INACTIVE_PORTAL: { id: '13.1', traversable: true },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15 },
    SPEEDPAD_RED_INACTIVE: { id: 14.1, traversable: true },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15 },
    SPEEDPAD_BLUE_INACTIVE: { id: 15.1, traversable: true },
    YELLOW_FLAG: { id: 16, traversable: true },
    YELLOW_FLAG_TAKEN: { id: '16.1', traversable: true },
    RED_ENDZONE: { id: 17, traversable: true },
    BLUE_ENDZONE: { id: 18, traversable: true },
    RED_BALL: { id: 'redball', traversable: true },
    BLUE_BALL: { id: 'blueball', traversable: true },
  };
  tileNames = {};
  keys(tileInfo).forEach(key => {
    tileNames[tileInfo[key].id] = key;
  });
}

export function resetTileInfo() {
  tileInfo = undefined;
  tileNames = undefined;
}
