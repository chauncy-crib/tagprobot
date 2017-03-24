// ==UserScript==
// @name          TagPro Example Bot
// @description   Limited example bot for TagPro.
// @version       0.1
// @grant         none
// @include       http://tagpro-maptest.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Cflakes, snaps_
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
    BLUE_ENDZONE = 18;

/*
 * This function will execute the provided function after tagpro.playerId
 * has been assigned.
 */
function waitForId(fn) {
    // Don't execute the function until tagpro.playerId has been assigned.
    if (!tagpro || !tagpro.playerId) {
        return setTimeout(function() {
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

    // Assign our own player object to `self` for readability.
    var self = tagpro.players[tagpro.playerId];
    
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
    Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function() {
        tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
        tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
        return this.m_linearVelocity;
    };

    /*
     * Returns the position (in pixels) of the specified flag station.
     *
     * searching_for: a string, one of either: 'ally_flag', 'enemy_flag',
     *     or 'neutral_flag'.
     */
    function findFlagStation(searching_for) {
        var looking_for_red_flag = 0,
            looking_for_blue_flag = 0,
            looking_for_neutral_flag = 0;

        looking_for_red_flag = (searching_for === 'ally_flag' && self.team === RED_TEAM) ||
            (searching_for === 'enemy_flag' && self.team === BLUE_TEAM);
        looking_for_blue_flag = (searching_for === 'ally_flag' && self.team === BLUE_TEAM) ||
            (searching_for === 'enemy_flag' && self.team === RED_TEAM);
        looking_for_yellow_flag = (searching_for === 'neutral_flag');

        for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
            for (var y = 0; y < yl; y++) {
                switch (Math.floor(tagpro.map[x][y])) {
                case RED_FLAG:    // Red flag found on tile
                    if (looking_for_red_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                case BLUE_FLAG:    // Blue flag found on tile
                    if (looking_for_blue_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                case YELLOW_FLAG:    // Yellow flag found on tile
                    if (looking_for_yellow_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                }
            }
        }
    }

    
    /*
     * Returns the position (in pixels) of the specified taken flag.
     *
     * searching_for: a string, one of either: 'ally_flag', 'enemy_flag',
     *     or 'neutral_flag'.
     */
    function findTakenFlag(searching_for) {
        var looking_for_red_flag = 0,
            looking_for_blue_flag = 0,
            looking_for_neutral_flag = 0;

        looking_for_red_flag = (searching_for === 'ally_flag' && self.team === RED_TEAM) ||
            (searching_for === 'enemy_flag' && self.team === BLUE_TEAM);
        looking_for_blue_flag = (searching_for === 'ally_flag' && self.team === BLUE_TEAM) ||
            (searching_for === 'enemy_flag' && self.team === RED_TEAM);
        looking_for_yellow_flag = (searching_for === 'neutral_flag');

        for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
            for (var y = 0; y < yl; y++) {
                switch (Math.floor(tagpro.map[x][y])) {
                case TAKEN_RED_FLAG:    // Red flag found on tile
                    if (looking_for_red_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                case TAKEN_BLUE_FLAG:    // Blue flag found on tile
                    if (looking_for_blue_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                case TAKEN_YELLOW_FLAG:    // Yellow flag found on tile
                    if (looking_for_yellow_flag) {
                        return {x: x * 40, y: y * 40};
                    }
                    break;
                }
            }
        }
    }
    
    // Returns the position of the endzone you should return a the flag to.
    function findEndzone() {
        for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
            for (var y = 0; y < yl; y++) {
                switch (Math.floor(tagpro.map[x][y])) {
                    case RED_ENDZONE:    // Red endzone found on tile
                        if (self.team === RED_TEAM) {
                            return {x: x * 40, y: y * 40};
                        }
                        break;
                    case BLUE_ENDZONE:    // Blue endzone found on tile
                        if (self.team === BLUE_TEAM) {
                            return {x: x * 40, y: y * 40};
                        }
                        break;
                }
            }
        }
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

    // Returns the position of the endzone you should return a the flag to.
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
        // Default state
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
tagpro.ready(function() {
    waitForId(script);
});

