import { TIMING_RUN_AVG_LEN, timeLog, time, logTimingsReport } from './global/timing';
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
import { getDTGraph, getMapName, getMapAuthor } from './interpret/interpret';
import { logHelpMenu, onKeyDown, isAutonomousMode, isVisualMode, move } from './interface/keys';
import { FSM } from './think/fsm';
import { dequeueChatMessages, setupChatCallback } from './interface/chat';
import { turnOnAllDrawings, initUiUpdateFunction } from './draw/draw';
import { updateNavMesh } from './interpret/graphToTriangulation';
import { getShortestPolypointPath } from './plan/astar';
import { drawEnemyPath, drawAllyPath } from './draw/triangulation';
import { getLocalGoalStateFromPath, getLQRAccelerationMultipliers } from './control/lqr';
import { funnelPolypoints } from './plan/funnel';


window.onkeydown = onKeyDown; // run onKeyDown any time a key is pressed to parse user input
let loopCount = 0; // keep track of how many times we have run loop()


/**
 * The base loop for defining the bot's behavior.
 */
function loop() {
  time(dequeueChatMessages);

  // If we're not autonomous and not drawing, then don't run the bot
  if (!isAutonomousMode() && !isVisualMode()) {
    requestAnimationFrame(loop);
    return;
  }

  const { map } = tagpro;
  const me = getMe();
  const myCenter = getPlayerCenter(me);
  const { goal, enemyShortestPath } = time(FSM, [me]);

  time(drawEnemyPath, [enemyShortestPath]);
  time(updateNavMesh, [map]);

  const polypointShortestPath = time(getShortestPolypointPath, [
    myCenter,
    goal,
    getDTGraph(),
  ]);

  const funnelledPath = time(funnelPolypoints, [polypointShortestPath, getDTGraph()]);
  time(drawAllyPath, [funnelledPath]);

  const localGoalState = time(getLocalGoalStateFromPath, [funnelledPath, me]);

  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const myCurrState = { x: myCenter.x, y: myCenter.y, vx: me.vx || 0, vy: me.vy || 0 };
  const accelValues = time(getLQRAccelerationMultipliers, [myCurrState, localGoalState]);

  if (isAutonomousMode()) move(accelValues);

  if (loopCount % TIMING_RUN_AVG_LEN === 0) logTimingsReport();
  loopCount += 1;

  // Call this loop again the next frame
  requestAnimationFrame(loop);
}


function setupSocketCallbacks() {
  timeLog('Setting up socket callbacks...');
  setupMapCallback();
  setupChatCallback();
}


/**
 * This is the "entry point" for our bot. We run necessary initializations and setups, and then run
 *   our "loop"
 */
function start() {
  // Setup
  timeLog('Initializing me...');
  initMe();
  timeLog('Setting up client velocity...');
  setupClientVelocity();
  timeLog('Computing tile info...');
  computeTileInfo();
  timeLog('Initializing locations...');
  initLocations();
  timeLog('Initializing isCenterFlag()...');
  initIsCenterFlag();
  timeLog('Initializing internal map...');
  initInternalMap(tagpro.map);
  timeLog('Initializing tiles to update...');
  initTilesToUpdate(tagpro.map);
  timeLog('Initializing nav mesh...');
  initNavMesh(tagpro.map);
  timeLog('Initializing UI update function...');
  initUiUpdateFunction();
  timeLog('Turning on all drawings...');
  turnOnAllDrawings();
  timeLog('Setting up role communication...');
  setupRoleCommunication();
  timeLog('Done.');
  logHelpMenu();

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
  setupSocketCallbacks();
  waitForId(start);
});
