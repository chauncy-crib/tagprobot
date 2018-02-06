import botLoop from './bot';
import { computeTileInfo } from './look/tileInfo';
import { setupMe, setupIsCenterFlag } from './look/gameState';
import { setupLocations } from './look/locations';
import {
  initInternalMap,
  setupTilesToUpdate,
  calculateNavMesh,
} from './interpret/graphToTriangulation';
import { onKeyDown } from './interface/keys';
import { chatHelpMenu } from './interface/chat';
import {
  turnOnAllDrawings,
  initUiUpdateProcess,
} from './draw/draw';

// Handle keypress and related events for manual/auto toggle
window.onkeydown = onKeyDown;


/**
 * Overriding this function to get a more accurate velocity of players. Velocity is saved in
 *   player.vx and vy. The refresh rate on our access to server size physics is only 4 Hz. We can
 *   check our client-side velocity at a much higher refresh rate (60 Hz), so we use this and store
 *   it in the me object. Units are in pixels/second. 1 meter = 2.5 tiles = 100 pixels.
 */
function setupVelocity() {
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 100;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 100;
    return this.m_linearVelocity;
  };
}


/**
 * Call this function every time a tagpro animation frame gets drawn
 */
function loop() {
  requestAnimationFrame(loop);
  botLoop();
}


/**
 * This is the "entry point" for our bot. We run necessary initializations and setups, and then run
 *   our "botLoop" every time an animation frame is drawn
 */
function start() {
  // Setup
  setupMe();
  setupVelocity();
  computeTileInfo();
  setupLocations();
  setupIsCenterFlag();
  chatHelpMenu();

  initInternalMap(tagpro.map);
  setupTilesToUpdate(tagpro.map);
  calculateNavMesh(tagpro.map, false);

  initUiUpdateProcess();
  turnOnAllDrawings();

  // Run the bot
  loop();
}


/**
 * This function will execute the provided function after tagpro.playerId has been assigned.
 * @param {function} fn - the function to execute after tagpro.playerId has been set
 */
function waitForId(fn) {
  // Don't execute the function until tagpro.playerId has been assigned.
  if (!tagpro || !tagpro.playerId) {
    setTimeout(() => {
      waitForId(fn);
    }, 100);
    return;
  }
  // Only run the script if we are not spectating.
  if (!tagpro.spectator) {
    fn();
  }
}


/**
 * Initialize the start script when tagpro is ready, and additionally wait
 * for the playerId property to be assigned.
 */
tagpro.ready(() => {
  waitForId(start);
});
