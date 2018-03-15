import { setupClientVelocity, initLocations } from './look/setup';
import { computeTileInfo } from './look/tileInfo';
import { getMe, initMe, initIsCenterFlag } from './look/gameState';
import { getDTGraph, initInternalMap, initTilesToUpdate, initNavMesh } from './interpret/setup';
import { logHelpMenu, onKeyDown, isAutonomousMode, move } from './interface/keys';
import { FSM } from './think/fsm';
import { dequeueChatMessages, setupChatCallback } from './interface/chat';
import { turnOnAllDrawings, initUiUpdateFunction } from './draw/draw';
import { updateAndRedrawEntireNavmesh } from './interpret/graphToTriangulation';
import { getShortestPolypointPath } from './plan/astar';
import { BRP } from './global/constants';
import { drawAllyPath } from './draw/triangulation';
import { getDesiredAccelerationMultipliers } from './control/physics';
import { assert } from './global/utils';

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
  const { map } = tagpro;
  const me = getMe();
  const goal = FSM(me);
  updateAndRedrawEntireNavmesh(map);

  const polypointShortestPath = getShortestPolypointPath(
    { xp: me.x + BRP, yp: me.y + BRP },
    goal,
    getDTGraph(),
  );

  drawAllyPath(polypointShortestPath);
  const target = getTargetFromPath(polypointShortestPath, me);


  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const accelValues = getDesiredAccelerationMultipliers(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our v velocity
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
  initMe();
  setupClientVelocity();
  computeTileInfo();
  initLocations();
  initIsCenterFlag();
  logHelpMenu();

  initInternalMap(tagpro.map);
  initTilesToUpdate(tagpro.map);
  initNavMesh(tagpro.map);

  initUiUpdateFunction();
  turnOnAllDrawings();

  setupChatCallback();

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
