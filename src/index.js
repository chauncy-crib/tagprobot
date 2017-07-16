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

import { PIXELS_PER_TILE, tileTypes } from './constants';
import { getTraversableCells, findApproxTile } from './helpers/map';
import { findMyEndzone, findFlagStation } from './helpers/gameState';
import { setupMe, getMe, getEnemy, getEnemyFC } from './helpers/player';
import getTarget from './helpers/path';
import move from './utils/movement';
import chat from './utils/chat';

let AUTONOMOUS = true;

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
  // Assign our own player object to `me` for readability.
  setupMe();
  const me = getMe();

  // Overriding this function to get a more accurate velocity of players.
  // Velocity is saved in player.vx and vy.
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
    return this.m_linearVelocity;
  };

  /*
   * The logic/flowchart.
   *   If team flag is home, sit on flag.
   *   If team flag is gone, go to enemy team flag.
   *   If an enemy FC is spotted at any time, chase.
   *
   * Note: There is NO pathfinding.
   */
  function getGoal() {
    let goal;
    // If the bot has the flag, go to the endzone
    if (me.flag) {
      // Really bad jukes !!!!! DISABLED FOR NOW
      if (false) { // eslint-disable-line no-constant-condition
        const chaser = getEnemy();
        goal = chaser;
        goal.x = (2 * (me.x + me.vx)) - (chaser.x + chaser.vx);
        goal.y = (2 * (me.y + me.vy)) - (chaser.y + chaser.vy);
        console.log('I have the flag. Fleeing enemy!');
        // Really bad caps
      } else {
        goal = findMyEndzone();
        console.log('I have the flag. Seeking endzone!');
      }
    } else {
      const enemyFC = getEnemyFC();
      if (enemyFC) { // If an enemy player in view has the flag, chase
        goal = enemyFC;
        goal.x = enemyFC.x + enemyFC.vx;
        goal.y = enemyFC.y + enemyFC.vy;
        console.log('I see an enemy with the flag. Chasing!');
      } else if (tagpro.ui.yellowFlagTakenByBlue) {
        goal = findApproxTile(tileTypes.BLUE_ENDZONE);
        console.log('Blue has the flag. Headed towards the Blue Endzone.');
      } else if (tagpro.ui.yellowFlagTakenByRed) {
        goal = findApproxTile(tileTypes.RED_ENDZONE);
        console.log('Red has the flag. Headed towards the Red Endzone.');
      } else {
        goal = findFlagStation();
        console.log("I don't know what to do. Going to central flag station!");
      }
    }
    return goal;
  }

  function getSeek() {
    const goal = getGoal();

    // Version for attempting path-planning
    const gridPosition = {
      x: Math.floor((me.x + 20) / PIXELS_PER_TILE),
      y: Math.floor((me.y + 20) / PIXELS_PER_TILE),
    };
    const gridTarget = {
      x: Math.floor(goal.x / PIXELS_PER_TILE),
      y: Math.floor(goal.y / PIXELS_PER_TILE),
    };
    const nearGoal = getTarget(
      gridPosition.x,
      gridPosition.y,
      gridTarget.x,
      gridTarget.y,
      getTraversableCells(1, tagpro.map),
    );
    nearGoal.x *= PIXELS_PER_TILE;
    nearGoal.y *= PIXELS_PER_TILE;

    // Version for not attempting path-planning
    // seek.x = goal.x - (self.x + self.vx);
    // seek.y = goal.y - (self.y + self.vy);
    return {
      x: nearGoal.x - (me.x + me.vx),
      y: nearGoal.y - (me.y + me.vy),
    };
  }

  function main() {
    requestAnimationFrame(main);

    if (AUTONOMOUS) {
      move(getSeek());
    }
  }

  main();
}

// Initialize the script when tagpro is ready, and additionally wait
// for the playerId property to be assigned.
tagpro.ready(() => {
  waitForId(script);
});
