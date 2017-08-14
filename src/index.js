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
// @license       2017
// ==/UserScript==

import botLoop from './bot';
import { computeTileInfo } from './tiles';
import { setupMe } from './helpers/player';
import { initMapTraversabilityCells } from './helpers/map';
import { onKeyDown, setupVelocity, isAutonomous } from './utils/interface';

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
 * This is the "entry point" for our bot. We initialize the global "me" variable, modify the way we
 * calculate velocity for players, and then run our "botLoop" every time an animation frame is drawn
 */
function start() {
  setupMe();
  setupVelocity();
  computeTileInfo();
  initMapTraversabilityCells(tagpro.map);

  function loop() {
    // Call this function every time a tagpro animation frame gets drawn
    requestAnimationFrame(loop);
    if (isAutonomous()) {
      botLoop();
    }
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
