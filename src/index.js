import botLoop from './bot';
import { computeTileInfo } from './tiles';
import { setupMe } from './helpers/player';
import { initMapTraversabilityCells } from './helpers/map';
import {
  onKeyDown,
  setupVelocity,
  chatHelpMenu,
} from './utils/interface';
import { graphFromTagproMap } from './navmesh/polygon';
import {
  drawPermanentNTSprites,
  initKeyPressesVisualization,
  initUiUpdateProcess,
  drawNavMesh,
} from './draw/drawings';

// Handle keypress and related events for manual/auto toggle
window.onkeydown = onKeyDown;


/*
 * This function will execute the provided function after tagpro.playerId
 * has been assigned.
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


/*
 * This is the "entry point" for our bot. We initialize the global "me"
 * variable, modify the way we calculate velocity for players, and then run our
 * "botLoop" every time an animation frame is drawn
 */
function start() {
  setupMe();
  setupVelocity();
  computeTileInfo();
  chatHelpMenu();
  initMapTraversabilityCells(tagpro.map);
  drawPermanentNTSprites();
  initKeyPressesVisualization();
  initUiUpdateProcess();

  const graph = graphFromTagproMap(tagpro.map);
  drawNavMesh(graph);

  function loop() {
    // Call this function every time a tagpro animation frame gets drawn
    requestAnimationFrame(loop);
    botLoop();
  }

  loop();
}


/*
 * Initialize the start script when tagpro is ready, and additionally wait
 * for the playerId property to be assigned.
 */
tagpro.ready(() => {
  waitForId(start);
});
