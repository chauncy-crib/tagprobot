import _ from 'lodash';
import FileSaver from 'file-saver';
import { timeLog } from './global/utils';
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
  getMapName,
  getMapAuthor,
  getUnmergedGraph,
  getMergedGraph,
  tilesToUpdate,
  tilesToUpdateValues,
  internalMap,
  setInternalMap,
  setTilesToUpdate,
  setTilesToUpdateValues,
  setMergedGraph,
  setUnmergedGraph,
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
import { Graph } from './global/class/Graph';

import cache from '../cache.json';


// Run onKeyDown any time a key is pressed to parse user input
window.onkeydown = onKeyDown;


function mapKey() {
  return `${getMapAuthor()}.${getMapName()}`;
}


function updateCache() {
  if (!_.has(cache, mapKey())) {
    const data = {};
    data.tilesToUpdate = tilesToUpdate;
    data.tilesToUpdateValues = tilesToUpdateValues;
    data.internalMap = internalMap;
    data.unmergedGraph = getUnmergedGraph();
    data.mergedGraph = getMergedGraph();
    cache[mapKey()] = data;
    const blob = new Blob([JSON.stringify(cache)]);
    FileSaver.saveAs(blob, 'cache.json');
  }
}


function loadCache() {
  if (_.has(cache, mapKey())) {
    timeLog('Loading cache...');
    const data = cache[mapKey()];
    setTilesToUpdate(data.tilesToUpdate);
    setTilesToUpdateValues(data.tilesToUpdateValues);
    setInternalMap(data.internalMap);
    setUnmergedGraph((new Graph()).fromObject(data.unmergedGraph));
    setMergedGraph((new Graph()).fromObject(data.mergedGraph));
    return true;
  }
  return false;
}


/**
 * The base loop for defining the bot's behavior.
 */
function botLoop() {
  dequeueChatMessages();

  // If we're not autonomous and not drawing, then don't run the bot
  if (!isAutonomousMode() && !isVisualMode()) return;

  const { map } = tagpro;
  const me = getMe();
  const { goal, enemyShortestPath } = FSM(me);
  drawEnemyPath(enemyShortestPath);
  updateNavMesh(map);

  const polypointShortestPath = getShortestPolypointPath(
    getPlayerCenter(me),
    goal,
    getDTGraph(),
  );

  const funnelledPath = funnelPolypoints(polypointShortestPath, getDTGraph());
  drawAllyPath(funnelledPath);

  const localGoalState = getLocalGoalStateFromPath(funnelledPath, me);

  // The desired acceleration multipliers the bot should achieve with arrow key presses. Positive
  //   directions are down and right.
  const accelValues = getDesiredAccelerationMultipliers(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our x velocity
    me.vy, // our y velocity
    localGoalState.x, // the x we are seeking toward (pixels)
    localGoalState.y, // the y we are seeking toward (pixels)
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


function setupSocketCallbacks() {
  timeLog('Setting up socket callbacks...');
  setupMapCallback();
  setupChatCallback();
}


/**
 * This is the "entry point" for our bot. We run necessary initializations and setups, and then run
 *   our "botLoop" every time an animation frame is drawn
 */
function start() {
  // Setup
  const cached = loadCache();
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
  if (!cached) {
    timeLog('Initializing internal map...');
    initInternalMap(tagpro.map);
    timeLog('Initializing tiles to update...');
    initTilesToUpdate(internalMap);
  }
  timeLog('Initializing nav mesh...');
  initNavMesh(internalMap, !cached);
  timeLog('Initializing UI update function...');
  initUiUpdateFunction();
  timeLog('Turning on all drawings...');
  turnOnAllDrawings();
  timeLog('Setting up role communication...');
  setupRoleCommunication();
  timeLog('Done.');
  logHelpMenu();
  updateCache();

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
