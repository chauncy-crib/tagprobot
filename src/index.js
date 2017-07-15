// ==UserScript==
// @name          Chauncy TagProbot
// @description   Limited example bot for TagPro.
// @version       0.1
// @grant         none
// @include       http://tagpro-maptest.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Cflakes, snaps_, altodyte, shanek21, davidabrahams, billmwong
// @namespace     http://www.reddit.com/user/snaps_
// @require       https://raw.githubusercontent.com/bgrins/javascript-astar/master/astar.js
// @license       2015
// ==/UserScript==

import _ from 'lodash';
import { getTraversableCells } from './helpers';

// Define global constants

/* global tagpro Box2D astar Graph*/

/* eslint-disable no-console*/
/* eslint-disable one-var, no-unused-vars*/
const EMPTY_TILE = 0,
  RED_TEAM = 1,
  BLUE_TEAM = 2,
  RED_FLAG = 3,
  TAKEN_RED_FLAG = 3.1,
  BLUE_FLAG = 4,
  TAKEN_BLUE_FLAG = 4.1,
  YELLOW_FLAG = 16,
  TAKEN_YELLOW_FLAG = 16.1,
  RED_ENDZONE = 17,
  BLUE_ENDZONE = 18,
  TAKEN_ENEMY_FLAG = null,
  TAKEN_ALLY_FLAG = null;

let ENEMY_FLAG = null,
  ALLY_FLAG = null,
  AUTONOMOUS = true;
/* eslint-enable one-var, no-unused-vars*/

const PIXEL_PER_TILE = 40;

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

// We define everything relevant to our bot inside this function.
function script() {
  // Assign our own player object to `self` for readability.
  const me = tagpro.players[tagpro.playerId];

  /*
   * Returns the position (in pixels x,y and grid positions xg, yg
   * of first of the specified tile type to appear starting in the
   * top left corner and moving in a page-reading fashion.
   */

  function findTile(targetTile) {
    for (let x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
      for (let y = 0; y < yl; y++) {
        if (tagpro.map[x][y] === targetTile) {
          return { x: x * PIXEL_PER_TILE, y: y * PIXEL_PER_TILE, xg: x, yg: y };
        }
      }
    }
    console.error(`Unable to find tile: ${targetTile}`);
    return {};
  }

  function findApproxTile(targetTile) {
    for (let x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
      for (let y = 0; y < yl; y++) {
        if (Math.floor(tagpro.map[x][y]) === Math.floor(targetTile)) {
          return { x: x * PIXEL_PER_TILE, y: y * PIXEL_PER_TILE, xg: x, yg: y };
        }
      }
    }
    console.error(`Unable to find tile: ${targetTile}`);
    return {};
  }

  /*
   * This function sets global variables with information about what
   * flag we want and those important ideological things.
   */
  function getDesiredFlag() {
    if (findApproxTile(YELLOW_FLAG) === null) {
      ENEMY_FLAG = (me.team === BLUE_TEAM ? RED_FLAG : BLUE_FLAG);
      ALLY_FLAG = (me.team === BLUE_TEAM ? BLUE_FLAG : RED_FLAG);
    } else {
      ENEMY_FLAG = YELLOW_FLAG;
      ALLY_FLAG = YELLOW_FLAG;
    }
  }

  // Set global variables
  getDesiredFlag();

  // Sends key events to move to a destination.
  function move(destination) {
    // TODO: address deadband variable with a comment
    const deadband = 4;
    if (destination.x > deadband) {
      tagpro.sendKeyPress('left', true);
      tagpro.sendKeyPress('right', false);
    } else if (destination.x < -deadband) {
      tagpro.sendKeyPress('right', true);
      tagpro.sendKeyPress('left', false);
    } else {
      tagpro.sendKeyPress('right', true);
      tagpro.sendKeyPress('left', true);
    }

    if (destination.y > deadband) {
      tagpro.sendKeyPress('up', true);
      tagpro.sendKeyPress('down', false);
    } else if (destination.y < -deadband) {
      tagpro.sendKeyPress('down', true);
      tagpro.sendKeyPress('up', false);
    } else {
      tagpro.sendKeyPress('up', true);
      tagpro.sendKeyPress('down', true);
    }
  }

  // Overriding this function to get a more accurate velocity of players.
  // Velocity is saved in player.vx and vy.
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
    return this.m_linearVelocity;
  };

  /*
   * Returns the position (in pixels) of the specified flag station, even if empty.
   *
   * searchingFor: a string, one of either: 'ally_flag', 'enemy_flag'
   */
  function findFlagStation(searchingFor) {
    let targetFlag = null;
    if (searchingFor === 'ally_flag') {
      targetFlag = ALLY_FLAG;
    } else if (searchingFor === 'enemy_flag') {
      targetFlag = ENEMY_FLAG;
    } else {
      console.error(`Flag station description does not exist: ${searchingFor}`);
    }

    return findApproxTile(targetFlag);
  }

  /*
   * Returns the position (in pixels) of the specified taken flag.
   *
   * searchingFor: a string, one of either: 'ally_flag', 'enemy_flag'
   */
  function findTakenFlag(searchingFor) { // eslint-disable-line no-unused-vars
    let targetFlag = null;
    if (searchingFor === 'ally_flag') {
      targetFlag = TAKEN_ALLY_FLAG;
    } else if (searchingFor === 'enemy_flag') {
      targetFlag = TAKEN_ENEMY_FLAG;
    } else {
      console.error(`Flag station description does not exist: ${searchingFor}`);
    }

    return findTile(targetFlag);
  }

  // Returns the position of the endzone you should return a the flag to.
  // TODO: return closest endzone tile instead of first
  function findEndzone() {
    return (me.team === BLUE_TEAM ? findTile(BLUE_ENDZONE) : findTile(RED_ENDZONE));
  }

  // Returns the enemy FC if in view.
  function enemyFC() {
    return _.find(tagpro.players, player => (
      player.flag && player.team !== me.team && !player.dead && player.draw
    ));
  }

  // Returns an enemy chaser if in view
  function enemyC() {
    return _.find(tagpro.players, player => (
      player.team !== me.team && !player.dead && player.draw
    ));
  }

  // Returns whether or not ally team's flag is taken
  function allyFlagTaken() {
    return (me.team === RED_TEAM && tagpro.ui.redFlagTaken)
      || (me.team === BLUE_TEAM && tagpro.ui.blueFlagTaken);
  }

  /*
   * takes in current location and target location (eg, the location of the flag) and the map
   * represented as a grid of 1 and 0, where 1s are traversable and 0s are not. Uses A* to calculate
   * the best path
   */
  function getTarget(myX, myY, targetX, targetY, grid) {
    // TODO: handle edge cases regarding target and current position
    // diagonal is true if we consider diagonal steps on the grid
    const diagonal = false;
    const graph = new Graph(grid, { diagonal });
    const start = graph.grid[myX][myY];
    const end = graph.grid[targetX][targetY];
    // calculate shortest path list
    const shortestPath = astar.search(graph, start, end,
      { heuristic: diagonal ? astar.heuristics.diagonal : astar.heuristics.manhattan });

    // Find the furthest cell in the direction of the next cell
    let winner = 0;
    let j = 0;
    if (shortestPath.length > 1) {
      const dx = shortestPath[0].x - myX;
      const dy = shortestPath[0].y - myY;
      for (let i = 0; i < shortestPath.length; i++) {
        const ndx = shortestPath[i].x - myX;
        if (dx === ndx) {
          winner += 1;
        } else {
          break;
        }
      }
      for (; j < winner; j++) {
        const ndy = shortestPath[j].y - myY;
        if (dy !== ndy) {
          winner = j;
          break;
        }
      }
    }
    const next = shortestPath[j];
    // TODO: this seems to throw null pointer when bot doesn't know where the center flag is.
    const res = { x: next.x, y: next.y };
    return res;
  }

  // Stole this function to send chat messages
  let lastMessage = 0;
  function chat(chatMessage) {
    const limit = 500 + 10;
    const now = new Date();
    const timeDiff = now - lastMessage;
    if (timeDiff > limit) {
      tagpro.socket.emit('chat', {
        message: chatMessage,
        toAll: 0,
      });
      lastMessage = new Date();
    } else if (timeDiff >= 0) {
      setTimeout(chat, limit - timeDiff, chatMessage);
    }
  }

  /*
   * The logic/flowchart.
   *   If team flag is home, sit on flag.
   *   If team flag is gone, go to enemy team flag.
   *   If an enemy FC is spotted at any time, chase.
   *
   * Note: There is NO pathfinding.
   */
  function main() {
    // Handle keypress and related events for manual/auto toggle
    window.onkeydown = event => {
      if (event.keyCode === 81) {
        AUTONOMOUS = !AUTONOMOUS;
        tagpro.sendKeyPress('up', true);
        tagpro.sendKeyPress('down', true);
        tagpro.sendKeyPress('left', true);
        tagpro.sendKeyPress('right', true);
        if (AUTONOMOUS) {
          chat('Autonomy Mode updated: now AUTONOMOUS!');
        } else {
          chat('Autonomy Mode updated: now MANUAL!');
        }
        setTimeout(() => { console.log(`Autonomy status: ${AUTONOMOUS}`); }, 200);
      }
    };

    requestAnimationFrame(main);

    const seek = {};
    let goal = null;
    const enemy = enemyFC();

    // If the bot has the flag, go to the endzone
    if (me.flag) {
      const chaser = enemyC();
      // Really bad jukes !!!!! DISABLED FOR NOW
      if (false) { // eslint-disable-line no-constant-condition
        goal = chaser;
        goal.x = (2 * (me.x + me.vx)) - (chaser.x + chaser.vx);
        goal.y = (2 * (me.y + me.vy)) - (chaser.y + chaser.vy);
        console.log('I have the flag. Fleeing enemy!');
        // Really bad caps
      } else {
        goal = findEndzone();
        console.log('I have the flag. Seeking endzone!');
      }
    } else if (enemy) { // If an enemy player in view has the flag, chase
      goal = enemy;
      goal.x = enemy.x + enemy.vx;
      goal.y = enemy.y + enemy.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (allyFlagTaken()) { // If ally flag taken, go to the enemy flag station
      goal = findFlagStation('enemy_flag');
      console.log('Ally flag is taken. Chasing enemy with flag!');
    } else if (ENEMY_FLAG === YELLOW_FLAG) { // If neutral flag game
      if (tagpro.ui.yellowFlagTakenByBlue) {
        goal = findApproxTile(BLUE_ENDZONE);
        console.log('Blue has the flag. Headed towards the Blue Endzone.');
      } else if (tagpro.ui.yellowFlagTakenByRed) {
        goal = findApproxTile(RED_ENDZONE);
        console.log('Red has the flag. Headed towards the Red Endzone.');
      } else {
        goal = findFlagStation('ally_flag');
        console.log("I don't know what to do. Going to central flag station!");
      }
    } else { // If two-flag game (presumed, not tested)
      goal = findFlagStation('ally_flag');
      console.log("I don't know what to do. Going to ally flag station!");
    }

    // Version for attempting path-planning
    const gridPosition = {
      x: Math.floor((me.x + 20) / PIXEL_PER_TILE),
      y: Math.floor((me.y + 20) / PIXEL_PER_TILE),
    };
    const gridTarget = { x: Math.floor(goal.x / PIXEL_PER_TILE),
      y: Math.floor(goal.y / PIXEL_PER_TILE) };
    const nearGoal = getTarget(gridPosition.x, gridPosition.y,
      gridTarget.x, gridTarget.y,
      getTraversableCells(1, tagpro.map, me));
    nearGoal.x *= PIXEL_PER_TILE;
    nearGoal.y *= PIXEL_PER_TILE;

    seek.x = nearGoal.x - (me.x + me.vx);
    seek.y = nearGoal.y - (me.y + me.vy);


    // Version for not attempting path-planning
    // seek.x = goal.x - (self.x + self.vx);
    // seek.y = goal.y - (self.y + self.vy);
    if (AUTONOMOUS) {
      move(seek);
    }
  }

  main();
}
// Initialize the script when tagpro is ready, and additionally wait
// for the playerId property to be assigned.
tagpro.ready(() => {
  waitForId(script);
});
