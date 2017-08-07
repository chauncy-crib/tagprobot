import keys from 'lodash/keys';
import includes from 'lodash/includes';
import isUndefined from 'lodash/isUndefined';
import { assert } from './utils/asserts';
import { amBlue, amRed } from './helpers/player';

let tileInfo;
let tileNames;

/*
 * Stores all information we need about tiles in the tileInfo object, and creates the tileNames
 * object so that we can quickly map from an id to a name. This function depends on amBlue and
 * amRed, so the current player must be defined. We call this function once, after our player has an
 * id.
 */
export function computeTileInfo() {
  tileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false, permanent: true },
    SQUARE_WALL: { id: 1, traversable: false, permanent: true },
    ANGLE_WALL_1: { id: 1.1, traversable: false, permanent: true },
    ANGLE_WALL_2: { id: 1.2, traversable: false, permanent: true },
    ANGLE_WALL_3: { id: 1.3, traversable: false, permanent: true },
    ANGLE_WALL_4: { id: 1.4, traversable: false, permanent: true },
    REGULAR_FLOOR: { id: 2, traversable: true, permanent: true },
    RED_FLAG: { id: 3, traversable: amRed(), permanent: false },
    RED_FLAG_TAKEN: { id: 3.1, traversable: true, permanent: false },
    BLUE_FLAG: { id: 4, traversable: amBlue(), permanent: false },
    BLUE_FLAG_TAKEN: { id: 4.1, traversable: true, permanent: false },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_INACTIVE: { id: '5.1', traversable: true, permanent: false },
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
    INACTIVE_BOMB: { id: '10.1', traversable: true, permanent: false },
    RED_TEAMTILE: { id: 11, traversable: true, permanent: true },
    BLUE_TEAMTILE: { id: 12, traversable: true, permanent: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15, permanent: false },
    INACTIVE_PORTAL: { id: '13.1', traversable: true, permanent: false },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_RED_INACTIVE: { id: 14.1, traversable: true, permanent: false },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_BLUE_INACTIVE: { id: 15.1, traversable: true, permanent: false },
    YELLOW_FLAG: { id: 16, traversable: true, permanent: false },
    YELLOW_FLAG_TAKEN: { id: '16.1', traversable: true, permanent: false },
    RED_ENDZONE: { id: 17, traversable: true, permanent: true },
    BLUE_ENDZONE: { id: 18, traversable: true, permanent: true },
    RED_BALL: { id: 'redball', traversable: true, permanent: false },
    BLUE_BALL: { id: 'blueball', traversable: true, permanent: false },
  };
  tileNames = {};
  keys(tileInfo).forEach(key => {
    tileNames[tileInfo[key].id] = key;
  });
}

/*
 * @param {number} tileID - the ID of the tile whose property we want
 * @param {String} property - the name of a property stored in tileInfo
 * @return - the property for the input tile
 */
export function getTileProperty(tileID, property) {
  const tileIDString = String(tileID);
  assert(includes(keys(tileNames), tileIDString), `Unknown tileID: ${tileID}`);
  const tileName = tileNames[tileID];
  return tileInfo[tileName][property];
}

/*
 * Returns true if tileID is traversable without consequences.
 *
 * Traversable includes: regular floor, all flags, inactive speedpad,
 *   inactive gate, friendly gate, inactive bomb, teamtiles, inactive
 *   portal, endzones
 * Nontraversable includes: empty space, walls, active speedpad, any
 *   powerup, spike, button, enemy/green gate, bomb, active portal
 *
 * @param {number} tileID - the ID of the tile that should be checked for
 * traversability
 */
export function isTraversable(tileID) {
  return getTileProperty(tileID, 'traversable');
}

/*
 * Returns true if a tile containing this tileID will never change.
 * Some permanent examples: EMPTY_SQUARE, SPIKE
 * Non-permanent examples: INACTIVE GATE, YELLOW_FLAG_TAKEN
 *
 * @param {number} tileID - the ID of the tile that should be checked for
 * permanence
 */
export function isPermanent(tileID) {
  return getTileProperty(tileID, 'permanent');
}

/*
 * Is circular nontraversable object? Returns a boolean stating whether or not
 * the given nontraversable object tile ID is a circular nontraversable object.
 *
 * Circular nontraversable objects include: boosts, powerups, spikes, buttons,
 * bombs, and active portals
 *
 * @param {number} tileID - the ID of the tile that should be checked if it is
 * a circular nontraversable object.
 */
export function isCNTO(tileID) {
  return Boolean(getTileProperty(tileID, 'radius'));
}


/*
 * @param {String} name - the name of a tile
 * @return - the id for the input tile name
 */
export function getTileId(name) {
  assert(includes(keys(tileInfo), name), `Unknown tile name: ${name}`);
  return tileInfo[name].id;
}


/*
 * @param {number} tileID - the id for a tile
 * @param {String} name - the name of a tile
 * @return - true if tileId is the id of the named tile
 */
export function isTileType(tileId, name) {
  assert(includes(keys(tileInfo), name), `Unknown tile name: ${name}`);
  return getTileId(name) === tileId;
}


/*
 * Get circular nontraversable object radius. Returns the radius, in pixels, of
 * the given circular nontraversable object tile ID.
 *
 * Circular nontraversable objects include: boosts, powerups, spikes, buttons,
 * bombs, and active portals
 *
 * @param {number} tileID - the ID of the circular nontraversable tile that you
 * wish to get the radius of
 */
export function getCNTORadius(tileID) {
  assert(!getTileProperty(tileID, 'traversable'), `A traversable tile was given: ${tileID}`);
  assert(tileNames[tileID] !== 'marsball', 'Marsball was given. Case is not handled.');
  assert(!isUndefined(getTileProperty(tileID, 'radius')),
    `A noncircular nontraversable tile was given: ${tileID}`);
  return tileInfo[tileNames[tileID]].radius;
}
