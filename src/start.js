import {
  TIMING_RUN_AVG_LEN,
  time,
  timeLog,
  timeFunc,
  logTimingsReport,
} from './global/timing';
import { BRP } from './global/constants';
import { setupClientVelocity, initLocations, setupRoleCommunication } from './look/setup';
import { computeTileInfo } from './look/tileInfo';
import { getMe, initMe, initIsCenterFlag } from './look/gameState';
import { getPlayerCenter } from './look/playerLocations';
import {
  initInternalMap,
  initTilesToUpdate,
  initNavMesh,
  setupMapCallback,
} from './interpret/setup';
import {
  getDTGraph,
  internalMap,
} from './interpret/interpret';
import { logHelpMenu, onKeyDown, isAutonomousMode, isVisualMode, move } from './interface/keys';
import { FSM } from './think/fsm';
import { dequeueChatMessages, setupChatCallback } from './interface/chat';
import { turnOnAllDrawings, initUiUpdateFunction } from './draw/draw';
import { updateNavMesh } from './interpret/graphToTriangulation';
import { getShortestPolypointPath } from './plan/astar';
import { drawEnemyPath, drawAllyPath } from './draw/triangulation';
import { getDesiredAccelerationMultipliers } from './control/physics';
import { getLocalGoalStateFromPath } from './control/lqr';
import { funnelPolypoints } from './plan/funnel';
import { isCached } from './cache/cache';
import { updateCache } from './cache/save';
import { loadCache } from './cache/load';


window.onkeydown = onKeyDown; // run onKeyDown any time a key is pressed to parse user input
let loopCount = 0; // keep track of how many times we have run loop()


/**
 * The base loop for defining the bot's behavior.
 */
function loop() {
  timeFunc(dequeueChatMessages);

  // If we're not autonomous and not drawing, then don't run the bot
  if (!isAutonomousMode() && !isVisualMode()) return;

  const { map } = tagpro;
  const me = getMe();
  const { goal, enemyShortestPath } = timeFunc(FSM, [me]);

  timeFunc(drawEnemyPath, [enemyShortestPath]);
  timeFunc(updateNavMesh, [map]);

  const polypointShortestPath = timeFunc(getShortestPolypointPath, [
    getPlayerCenter(me),
    goal,
    getDTGraph(),
  ]);

  const funnelledPath = timeFunc(funnelPolypoints, [polypointShortestPath, getDTGraph()]);
  timeFunc(drawAllyPath, [funnelledPath]);

  const localGoalState = timeFunc(getLocalGoalStateFromPath, [funnelledPath, me]);

  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const accelValues = timeFunc(getDesiredAccelerationMultipliers, [
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our x velocity
    me.vy, // our y velocity
    localGoalState.x, // the x we are seeking toward (pixels)
    localGoalState.y, // the y we are seeking toward (pixels)
  ]);

  if (isAutonomousMode()) move(accelValues);

  if (loopCount % TIMING_RUN_AVG_LEN === 0) logTimingsReport();
  loopCount += 1;

  // Call this loop again the next frame
  requestAnimationFrame(loop);
}


/**
 * This is the "entry point" for our bot. We run necessary initializations and setups, and then run
 *   our "loop"
 */
function start() {
  timeLog('Tagpro id recieved.');
  const stateTime = time();
  // Setup
  initMe();
  timeLog('Initialized me.');
  setupClientVelocity();
  timeLog('Set up client velocity.');
  computeTileInfo();
  timeLog('Computed tile info.');
  initLocations();
  timeLog('Initialized locations.');
  initIsCenterFlag();
  timeLog('Initialized isCenterFlag().');
  if (!isCached()) {
    initInternalMap(tagpro.map);
    timeLog('Initialized internal map.');
    initTilesToUpdate(internalMap);
    timeLog('Initialized tiles to update.');
  }
  initNavMesh(internalMap);
  timeLog('Initialized nav mesh.');
  initUiUpdateFunction();
  timeLog('Initialized UI update function.');
  turnOnAllDrawings();
  timeLog('Turned on all drawings.');
  setupRoleCommunication();
  timeLog('Set up role communication.');
  logHelpMenu();
  timeLog('Help menu logged.');
  updateCache();
  timeLog('Startup script time.', stateTime);

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


function setupSocketCallbacks() {
  timeLog('Tagpro is ready.');
  setupMapCallback(() => {
    loadCache();
    waitForId(start);
  });
  setupChatCallback();
}


/**
 * Initialize the start script when tagpro is ready, and additionally wait
 * for the playerId property to be assigned.
 */
tagpro.ready(() => {
  setupSocketCallbacks();
});
