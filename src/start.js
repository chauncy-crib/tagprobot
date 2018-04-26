import { assert, timeLog } from './global/utils';
import { BRP } from './global/constants';
import { setupClientVelocity, initLocations, setupRoleCommunication } from './look/setup';
import { computeTileInfo } from './look/tileInfo';
import { getMe, initMe, initIsCenterFlag } from './look/gameState';
import { getDTGraph, initInternalMap, initTilesToUpdate, initNavMesh } from './interpret/setup';
import { logHelpMenu, onKeyDown, isAutonomousMode, isVisualMode, move } from './interface/keys';
import { FSM } from './think/fsm';
import { dequeueChatMessages, setupChatCallback } from './interface/chat';
import { turnOnAllDrawings, initUiUpdateFunction } from './draw/draw';
import { updateNavMesh } from './interpret/graphToTriangulation';
import { getShortestPolypointPath } from './plan/astar';
import { drawAllyPath } from './draw/triangulation';
import { getDesiredAccelerationMultipliers } from './control/physics';
import { funnelPolypoints } from './plan/funnel';


// Run onKeyDown any time a key is pressed to parse user input
window.onkeydown = onKeyDown;


/**
 * @param {PolypointState[]} path - a list of states returned by getShortestPolypointPath()
 * @param {{x: number, y: number}} me - the object from tagpro.players, storing x and y pixel
 *   locations
 * @returns {{xp: number, yp: number}} the x and y location our local-controller should steer toward
 */
function getTargetFromPath(path, me) {
  const target = { xp: me.x + BRP, yp: me.y + BRP };
  if (path) {
    const ppPathLength = path.length;
    assert(ppPathLength > 1, `Shortest path was length ${ppPathLength}`);
    target.xp = path[1].point.x;
    target.yp = path[1].point.y;
  } else {
    console.warn('Shortest path was null, using own location as target');
  }
  return target;
}


/**
 * The base loop for defining the bot's behavior.
 */
function botLoop() {
  dequeueChatMessages();

  // If we're not autonomous or drawing, then don't run the bot
  if (!isAutonomousMode() && !isVisualMode()) return;

  const { map } = tagpro;
  const me = getMe();
  const goal = FSM(me);
  updateNavMesh(map);

  const polypointShortestPath = getShortestPolypointPath(
    { xp: me.x + BRP, yp: me.y + BRP },
    goal,
    getDTGraph(),
  );

  const funnelledPath = funnelPolypoints(polypointShortestPath, getDTGraph());
  drawAllyPath(funnelledPath);

  const target = getTargetFromPath(funnelledPath, me);

  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const accelValues = getDesiredAccelerationMultipliers(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our x velocity
    me.vy, // our y velocity
    target.xp, // the x we are seeking toward (pixels)
    target.yp, // the y we are seeking toward (pixels)
  );
  if (isAutonomousMode()) move(accelValues);
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
  timeLog('Setting up chat callback...');
  setupChatCallback();
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
  waitForId(start);
});
