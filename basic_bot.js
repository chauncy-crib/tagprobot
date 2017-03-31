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
// @license       2015
// ==/UserScript==

// Define global constants
var EMPTY_TILE = 0,
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
    ENEMY_FLAG = null,
    TAKEN_ENEMY_FLAG = null,
    ALLY_FLAG = null,
    TAKEN_ALLY_FLAG = null;

/*
 * This function will execute the provided function after tagpro.playerId
 * has been assigned.
 */
function waitForId(fn) {
    // Don't execute the function until tagpro.playerId has been assigned.
    if (!tagpro || !tagpro.playerId) {
        return setTimeout(function () {
            waitForId(fn);
        }, 100);
    } else {
        // Only run the script if we are not spectating.
        if (!tagpro.spectator) {
            fn();
        }
    }
}

// We define everything relevant to our bot inside this function.
function script() {

    /*
     * This function sets global variables with information about what
     * flag we want and those important ideological things.
     */
    function getDesiredFlag() {
        if (findApproxTile(YELLOW_FLAG) == null) {
            ENEMY_FLAG = (self.team === BLUE_TEAM ? RED_FLAG : BLUE_FLAG);
            ALLY_FLAG = (self.team === BLUE_TEAM ? BLUE_FLAG : RED_FLAG);
        } else {
            ENEMY_FLAG = YELLOW_FLAG;
            ALLY_FLAG = YELLOW_FLAG;
        }
    }

    // Assign our own player object to `self` for readability.
    var self = tagpro.players[tagpro.playerId];
    // Set global variables
    getDesiredFlag();

    // Sends key events to move to a destination.
    function move(destination) {
        if (destination.x > 1) {
            tagpro.sendKeyPress("left", true);
            tagpro.sendKeyPress("right", false);
        } else if (destination.x < -1) {
            tagpro.sendKeyPress("right", true);
            tagpro.sendKeyPress("left", false);
        } else {
            tagpro.sendKeyPress("right", true);
            tagpro.sendKeyPress("left", true);
        }

        if (destination.y > 1) {
            tagpro.sendKeyPress("up", true);
            tagpro.sendKeyPress("down", false);
        } else if (destination.y < -1) {
            tagpro.sendKeyPress("down", true);
            tagpro.sendKeyPress("up", false);
        } else {
            tagpro.sendKeyPress("up", true);
            tagpro.sendKeyPress("down", true);
        }
    }

    // Overriding this function to get a more accurate velocity of players.
    // Velocity is saved in player.vx and vy.
    Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function () {
        tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
        tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
        return this.m_linearVelocity;
    };

    /*
     * Returns the position (in pixels x,y and grid positions xg, yg
     * of first of the specified tile type to appear starting in the
     * top left corner and moving in a page-reading fashion.
     */

    function findTile(target_tile) {
        for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
            for (var y = 0; y < yl; y++) {
                if (tagpro.map[x][y] === target_tile) {
                    return {x: x * 40, y: y * 40, xg: x, yg: y};
                }
            }
        }
        console.error("Unable to find tile: " + target_tile);
    }

    function findApproxTile(target_tile) {
        return findTile(Math.floor(target_tile));
    }

    /*
     * Returns the position (in pixels) of the specified flag station.
     *
     * searching_for: a string, one of either: 'ally_flag', 'enemy_flag'
     */
    function findFlagStation(searching_for) {
        var target_flag = null;
        if (searching_for === 'ally_flag') {
            target_flag = ALLY_FLAG;
        } else if (searching_for === 'enemy_flag') {
            target_flag = ENEMY_FLAG;
        } else {
            console.error("Flag station description does not exist: " + searching_for);
        }

        return findTile(target_flag);
    }

    /*
     * Returns the position (in pixels) of the specified taken flag.
     *
     * searching_for: a string, one of either: 'ally_flag', 'enemy_flag'
     */
    function findTakenFlag(searching_for) {
        var target_flag = null;
        if (searching_for === 'ally_flag') {
            target_flag = TAKEN_ALLY_FLAG;
        } else if (searching_for === 'enemy_flag') {
            target_flag = TAKEN_ENEMY_FLAG;
        } else {
            console.error("Flag station description does not exist: " + searching_for);
        }

        return findTile(target_flag);
    }

    // Returns the position of the endzone you should return a the flag to.
    // TODO: return closest endzone tile instead of first
    function findEndzone() {
        return (self.team == BLUE_TEAM ? findTile(BLUE_ENDZONE) : findTile(RED_ENDZONE));
    }

    // Returns the enemy FC if in view.
    function enemyFC() {
        for (var id in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(id))
                continue;

            var player = tagpro.players[id];

            if (player.team === self.team || player.dead || !player.draw)
                continue;
            if (player.flag)
                return player;
        }
    }

    // Returns whether or not ally team's flag is taken
    function allyFlagTaken() {
        return (self.team === RED_TEAM && tagpro.ui.redFlagTaken) || (self.team === BLUE_TEAM && tagpro.ui.blueFlagTaken);
    }

    // Returns a 2D array of traversable (1) and impassable (0) tiles.
    function getEmptyTiles() {
        var xl = tagpro.map.length,
            yl = tagpro.map[0].length,
            empty_tiles = [];

        for (var x = 0; x < xl; x++) {
            empty_tiles[x] = new Array(yl);
            for (var y = 0; y < yl; y++) {
                if (Math.floor(tagpro.map[x][y]) == EMPTY_TILE) {
                    empty_tiles[x][y] = 1;
                }
                else {
                    empty_tiles[x][y] = 0;
                }
            }
        }
        console.log(empty_tiles);
        return empty_tiles;
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
        requestAnimationFrame(main);

        var seek = {},
            goal = null,
            flag = null,
            enemy = enemyFC();

        // If the bot has the flag, go to the endzone
        if (self.flag) {
            goal = findEndzone();
            console.log("I have the flag. Seeking endzone!");
        }
        // If an enemy player in view has the flag, chase
        else if (enemy) {
            goal = enemy;
            goal.x = enemy.x + enemy.vx;
            goal.y = enemy.y + enemy.vy;
            console.log("I see an enemy with the flag. Chasing!");
        }
        // If ally flag taken, go to the enemy flag station
        else if (allyFlagTaken()) {
            goal = findFlagStation('enemy_flag');
            console.log("Ally flag is taken. Chasing enemy with flag!");
        }
        // If neutral flag game
        else if (ENEMY_FLAG === YELLOW_FLAG) {
            if (tagpro.ui.yellowFlagTakenByBlue) {
                goal = findApproxTile(BLUE_ENDZONE);
                console.log("Blue has the flag. Headed towards the Blue Endzone.");
            } else if (tagpro.ui.yellowFlagTakenByRed) {
                goal = findApproxTile(RED_ENDZONE);
                console.log("Red has the flag. Headed towards the Red Endzone.");
            } else {
                goal = findFlagStation('ally_flag');
                console.log("I don't know what to do. Going to central flag station!");
            }
        }
        // If two-flag game (presumed, not tested)
        else {
            goal = findFlagStation('ally_flag');
            console.log("I don't know what to do. Going to ally flag station!");
        }

        seek.x = goal.x - (self.x + self.vx);
        seek.y = goal.y - (self.y + self.vy);
        move(seek);
    }

    main();
}

// Initialize the script when tagpro is ready, and additionally wait
// for the playerId property to be assigned.
tagpro.ready(function () {
    waitForId(script);
});
