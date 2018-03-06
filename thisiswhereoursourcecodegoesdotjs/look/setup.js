import { assert } from '../global/utils';
import { centerOfMass } from './tileLocations';
import { tileIsOneOf } from './tileInfo';


export const tileLocations = {};


/**
 * Overriding this function to get a more accurate velocity of players. Velocity is saved in
 *   player.vx and vy. The refresh rate on our access to server size physics is only 4 Hz. We can
 *   check our client-side velocity at a much higher refresh rate (60 Hz), so we use this and store
 *   it in the me object. Units are in pixels/second. 1 meter = 2.5 tiles = 100 pixels.
 */
export function setupClientVelocity() {
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 100;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 100;
    return this.m_linearVelocity;
  };
}


/**
 * Parses each tile of the TagPro map. If it discovers a flag, add its location to the tileLocations
 *   object. Also defines the endzone positions for red and blue teams.
 */
export function initLocations() {
  assert(tagpro.map, 'tagpro.map is undefined');
  tileLocations.BLUE_ENDZONE = centerOfMass('BLUE_ENDZONE');
  tileLocations.RED_ENDZONE = centerOfMass('RED_ENDZONE');
  for (let xt = 0, xl = tagpro.map.length; xt < xl; xt++) {
    for (let yt = 0, yl = tagpro.map[0].length; yt < yl; yt++) {
      if (tileIsOneOf(tagpro.map[xt][yt], ['RED_FLAG', 'RED_FLAG_TAKEN'])) {
        tileLocations.RED_FLAG = { xt, yt };
        tileLocations.RED_FLAG_TAKEN = { xt, yt };
      } else if (tileIsOneOf(tagpro.map[xt][yt], ['BLUE_FLAG', 'BLUE_FLAG_TAKEN'])) {
        tileLocations.BLUE_FLAG = { xt, yt };
        tileLocations.BLUE_FLAG_TAKEN = { xt, yt };
      } else if (tileIsOneOf(tagpro.map[xt][yt], ['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN'])) {
        tileLocations.YELLOW_FLAG = { xt, yt };
        tileLocations.YELLOW_FLAG_TAKEN = { xt, yt };
      }
    }
  }
}
