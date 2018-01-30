import botLoop from './bot';
import { computeTileInfo } from './tiles';
import { setupIsCenterFlag } from './helpers/constants';
import { setupMe } from './helpers/player';
import { setupLocations } from './helpers/finders';
import { initMapTraversabilityCells, initInternalMap } from './helpers/map';
import {
  onKeyDown,
  setupVelocity,
  chatHelpMenu,
} from './utils/interface';
import { calculateNavMesh } from './navmesh/triangulation';
import {
  turnOnAllDrawings,
  initUiUpdateProcess,
} from './draw/draw';

// Handle keypress and related events for manual/auto toggle
window.onkeydown = onKeyDown;


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

  initMapTraversabilityCells(tagpro.map);
  initInternalMap(tagpro.map);
  calculateNavMesh(tagpro.map, false);

  initUiUpdateProcess();
  turnOnAllDrawings();

  // Run the bot
  loop();
}


/**
 * Initialize the start script when tagpro is ready, and additionally wait
 * for the playerId property to be assigned.
 */
tagpro.ready(() => {
  waitForId(start);
});
