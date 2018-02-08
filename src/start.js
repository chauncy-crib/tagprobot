import { computeTileInfo } from './look/tileInfo';
import { initMe, initIsCenterFlag } from './look/gameState';
import { setupClientVelocity, initLocations } from './look/setup';
import {
  initInternalMap,
  initTilesToUpdate,
  calculateNavMesh,
} from './interpret/graphToTriangulation';
import { getAccelValues } from './control/physics';
import { onKeyDown, isAutonomousMode, isVisualMode, move } from './interface/keys';
import { chatHelpMenu, dequeueChatMessages } from './interface/chat';
import { turnOnAllDrawings, initUiUpdateFunction } from './draw/draw';


// Handle keypress and related events for manual/auto toggle
window.onkeydown = onKeyDown;


/**
 * The base loop for defining the bot's behavior.
 */
function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getAccelValues());
  } else if (isVisualMode()) {
    getAccelValues();
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
  initMe();
  setupClientVelocity();
  computeTileInfo();
  initLocations();
  initIsCenterFlag();
  chatHelpMenu();

  initInternalMap(tagpro.map);
  initTilesToUpdate(tagpro.map);
  calculateNavMesh(tagpro.map);

  initUiUpdateFunction();
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
