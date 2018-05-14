import {
  getLoopCount,
  incrementLoopCount,
  TIMING_RUN_AVG_LEN,
  time,
  timeLog,
  timeFunc,
  logTimingsReport,
} from './global/timing';
import { setupClientVelocity, initLocations, setupRoleCommunication } from './look/setup';
import { computeTileInfo } from './look/tileInfo';
import { getMe, initMe, initIsCenterFlag, isCenterFlag } from './look/gameState';
import { getPlayerCenter } from './look/playerLocations';
import { findEnemyEndZone, findEnemyFlagStation } from './look/tileLocations';
import {
  initInternalMap,
  initTilesToUpdate,
  initNavMesh,
  onMapReady,
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
import { VALUE_OF_CAP } from './plan/constants';
import { getShortestPolypointPath } from './plan/astar';
import { drawEnemyPath, drawAllyPath } from './draw/triangulation';
import { getLocalGoalStateFromPath } from './control/lqr';
import { getLQRAccelerationMultipliers } from './control/lqr.master';
import { funnelMyPolypoints } from './plan/funnel.master';
import { isCached } from './cache/cache';
import { updateCache } from './cache/save';
import { loadCache } from './cache/load';


window.onkeydown = onKeyDown; // run onKeyDown any time a key is pressed to parse user input


/**
 * The base loop for defining the bot's behavior.
 */
function loop() {
  timeFunc(dequeueChatMessages);

  // If we're not autonomous and not drawing, then don't run the bot
  if (!isAutonomousMode() && !isVisualMode()) {
    requestAnimationFrame(loop);
    return;
  }

  const { map } = tagpro;
  const me = getMe();
  const myCenter = getPlayerCenter(me);
  const { globalGoal, enemyShortestPath } = timeFunc(FSM, [me]);

  timeFunc(drawEnemyPath, [enemyShortestPath]);
  timeFunc(updateNavMesh, [map]);

  const pathResult = timeFunc(getShortestPolypointPath, [
    myCenter,
    globalGoal,
    getDTGraph(),
  ]);
  let { shortestPath } = pathResult;
  const { pathCost } = pathResult;
  if (pathCost > VALUE_OF_CAP) {
    shortestPath = timeFunc(getShortestPolypointPath, [
      myCenter,
      isCenterFlag() ? findEnemyEndZone() : findEnemyFlagStation(),
      getDTGraph(),
    ]).shortestPath;
  }


  const funnelledPath = timeFunc(funnelMyPolypoints, [shortestPath, getDTGraph()]);
  timeFunc(drawAllyPath, [funnelledPath]);

  const localGoalState = timeFunc(getLocalGoalStateFromPath, [funnelledPath, me]);

  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const myCurrState = { x: myCenter.x, y: myCenter.y, vx: me.vx || 0, vy: me.vy || 0 };
  const accelValues = timeFunc(getLQRAccelerationMultipliers, [myCurrState, localGoalState]);

  if (isAutonomousMode()) move(accelValues);

  if (getLoopCount() % TIMING_RUN_AVG_LEN === 0) logTimingsReport();
  incrementLoopCount();

  // Call this loop again the next frame
  requestAnimationFrame(loop);
}


/**
 * This is the "entry point" for our bot. We run necessary initializations and setups, and then run
 *   our "loop"
 */
function start() {
  timeLog('Tagpro id recieved.');
  initMe();
  timeLog('Initialized me.');
  loadCache();
  const startTime = time();
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
  initNavMesh(internalMap, !isCached());
  initUiUpdateFunction();
  timeLog('Initialized UI update function.');
  turnOnAllDrawings();
  timeLog('Turned on all drawings.');
  setupRoleCommunication();
  timeLog('Set up role communication.');
  logHelpMenu();
  timeLog('Help menu logged.');
  updateCache();
  timeLog('Startup script time.', startTime);

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
  onMapReady(() => {
    waitForId(start);
  });
  setupChatCallback();
}


/**
 * Initialize the start script when tagpro is ready, and additionally wait
 * for the playerId property to be assigned.
 */
tagpro.ready(setupSocketCallbacks);
