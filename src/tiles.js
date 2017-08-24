import _ from 'lodash';
import { assert } from './utils/asserts';
import { amBlue, amRed } from './helpers/player';


const tileInfo = {};
const tileNames = {};

/*
 * Stores all information we need about tiles in the tileInfo object, and creates the tileNames
 * object so that we can quickly map from an id to a name. This function depends on amBlue and
 * amRed, so the current player must be defined. We call this function once, after our player has an
 * id.
 */
export function computeTileInfo() {
  assert(_.isEmpty(tileInfo), 'tileInfo is not an empty object');
  assert(_.isEmpty(tileNames), 'tileNames is not an empty object');
  _.forOwn({
    EMPTY_SPACE: { id: 0, traversable: false, permanent: true },
    SQUARE_WALL: { id: 1, traversable: false, permanent: true },
    ANGLE_WALL_1: { id: 1.1, traversable: false, permanent: true },
    ANGLE_WALL_2: { id: 1.2, traversable: false, permanent: true },
    ANGLE_WALL_3: { id: 1.3, traversable: false, permanent: true },
    ANGLE_WALL_4: { id: 1.4, traversable: false, permanent: true },
    REGULAR_FLOOR: { id: 2, traversable: true, permanent: true },
    RED_FLAG: { id: 3, traversable: true, permanent: false },
    RED_FLAG_TAKEN: { id: 3.1, traversable: true, permanent: false },
    BLUE_FLAG: { id: 4, traversable: true, permanent: false },
    BLUE_FLAG_TAKEN: { id: 4.1, traversable: true, permanent: false },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_INACTIVE: { id: 5.1, traversable: true, permanent: false },
    POWERUP_SUBGROUP: { id: 6, traversable: false, radius: 15, permanent: false },
    JUKEJUICE: { id: 6.1, traversable: false, radius: 15, permanent: false },
    ROLLING_BOMB: { id: 6.2, traversable: false, radius: 15, permanent: false },
    TAGPRO: { id: 6.3, traversable: false, radius: 15, permanent: false },
    MAX_SPEED: { id: 6.4, traversable: false, radius: 15, permanent: false },
    SPIKE: { id: 7, traversable: false, radius: 14, permanent: true },
    BUTTON: { id: 8, traversable: false, radius: 8, permanent: true },
    INACTIVE_GATE: { id: 9, traversable: true, permanent: false },
    GREEN_GATE: { id: 9.1, traversable: false, permanent: false },
    RED_GATE: { id: 9.2, traversable: amRed(), permanent: false },
    BLUE_GATE: { id: 9.3, traversable: amBlue(), permanent: false },
    BOMB: { id: 10, traversable: false, radius: 15, permanent: false },
    INACTIVE_BOMB: { id: 10.1, traversable: true, permanent: false },
    RED_TEAMTILE: { id: 11, traversable: true, permanent: true },
    BLUE_TEAMTILE: { id: 12, traversable: true, permanent: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15, permanent: false },
    INACTIVE_PORTAL: { id: 13.1, traversable: true, permanent: false },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_RED_INACTIVE: { id: 14.1, traversable: true, permanent: false },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_BLUE_INACTIVE: { id: 15.1, traversable: true, permanent: false },
    YELLOW_FLAG: { id: 16, traversable: true, permanent: false },
    YELLOW_FLAG_TAKEN: { id: 16.1, traversable: true, permanent: false },
    RED_ENDZONE: { id: 17, traversable: true, permanent: true },
    BLUE_ENDZONE: { id: 18, traversable: true, permanent: true },
    RED_BALL: { id: 'redball', traversable: true, permanent: false },
    BLUE_BALL: { id: 'blueball', traversable: true, permanent: false },
  },
  (value, key) => {
    tileInfo[key] = value;
  });
  _.keys(tileInfo).forEach(key => {
    tileNames[tileInfo[key].id] = key;
  });
}


/*
 * @param {number} tileID - the ID of the tile
 * @param {String} property - the name of a property
 * @return {boolean} if the corresponding tile has a value for this property
 */
export function tileHasProperty(tileID, property) {
  const tileIDString = String(tileID);
  assert(_.has(tileNames, tileIDString), `Unknown tileID: ${tileID}`);
  const tileName = tileNames[tileID];
  return _.has(tileInfo[tileName], property);
}


/*
 * @param {number} tileID - the ID of the tile whose property we want
 * @param {String} property - the name of a property stored in tileInfo
 * @return the property for the input tile
 */
export function getTileProperty(tileID, property) {
  assert(tileHasProperty(tileID, property), `Unknown property for tile: ${tileID}, ${property}`);
  const tileName = tileNames[tileID];
  return tileInfo[tileName][property];
}


/*
 * Returns the Tagpro API tile ID for the specified tile name. The return is
 * a number if the ID is a whole number and a String if the ID contains a
 * decimal. This is because the Tagpro API stores decimal tile IDs as Strings.
 *
 * @param {String} name - the name of a tile
 * @return the id for the input tile name
 */
export function getTileId(name) {
  assert(_.has(tileInfo, name), `Unknown tileName: ${name}`);
  const tileId = tileInfo[name].id;

  if (!Number.isInteger(tileId)) {
    return tileId.toString();
  }

  return tileId;
}


/*
 * Returns whether or not the tileId and name match. If the tileId contains
 * a decimal, then it is converted to a String first before it is compared
 * with the named tile's ID in order to match the Tagpro API convention.
 *
 * @param {number} tileID - the id for a tile
 * @param {String} name - the name of a tile
 * @return true if tileId is the id of the named tile
 */
export function tileIsType(tileId, name) {
  if (!Number.isInteger(tileId)) {
    return tileId.toString() === getTileId(name);
  }

  return tileId === getTileId(name);
}
