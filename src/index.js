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
// @license       2008
// ==/UserScript==

import botLoop from './bot';
import { setupMe } from './helpers/player';
import { chat, setupVelocity } from './utils';

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
function start() {
  setupMe();
  setupVelocity();

  function loop() {
    // Call this function every time a tagpro animation frame gets drawn
    requestAnimationFrame(loop);
    if (AUTONOMOUS) {
      botLoop();
    }
  }

  loop();
}

// Initialize the start script when tagpro is ready, and additionally wait
// for the playerId property to be assigned.
tagpro.ready(() => {
  waitForId(start);
});
