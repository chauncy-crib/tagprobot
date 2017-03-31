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
var flag = true;
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
    TAKEN_ALLY_FLAG = null,
    AUTONOMOUS = true;

var tileTypes = {
    EMPTY_SPACE: 0,
    SQUARE_WALL: 1,
    ANGLE_WALL_1: 1.1,
    ANGLE_WALL_2: 1.2,
    ANGLE_WALL_3: 1.3,
    ANGLE_WALL_4: 1.4,
    REGULAR_FLOOR: 2,
    RED_FLAG: 3,
    RED_FLAG_TAKEN: 3.1,
    BLUE_FLAG: 4,
    BLUE_FLAG_TAKEN: 4.1,
    SPEEDPAD_ACTIVE: 5,
    SPEEDPAD_INACTIVE: 5.1,
    POWERUP_SUBGROUP: 6,
    JUKEJUICE: 6.1,
    ROLLING_BOMB: 6.2,
    TAGPRO: 6.3,
    MAX_SPEED: 6.4,
    SPIKE: 7,
    BUTTON: 8,
    INACTIVE_GATE: 9,
    GREEN_GATE: 9.1,
    RED_GATE: 9.2,
    BLUE_GATE: 9.3,
    BOMB: 10,
    INACTIVE_BOMB: 10.1,
    RED_TEAMTILE: 11,
    BLUE_TEAMTILE: 12,
    ACTIVE_PORTAL: 13,
    INACTIVE_PORTAL: 13.1,
    SPEEDPAD_RED_ACTIVE: 14,
    SPEEDPAD_RED_INACTIVE: 14.1,
    SPEEDPAD_BLUE_ACTIVE: 15,
    SPEEDPAD_BLUE_INACTIVE: 15.1,
    YELLOW_FLAG: 16,
    YELLOW_FLAG_TAKEN: 16.1,
    RED_ENDZONE: 17,
    BLUE_ENDZONE: 18
};

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
     * Returns the position (in pixels) of the specified flag station, even if empty.
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

        return findApproxTile(target_flag);
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

    // Returns an enemy chaser if in view
    function enemyC() {
        for (var id in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(id))
                continue;

            var player = tagpro.players[id];

            if (player.team === self.team || player.dead || !player.draw)
                continue;
            return player;
        }
    }

    // Returns whether or not ally team's flag is taken
    function allyFlagTaken() {
        return (self.team === RED_TEAM && tagpro.ui.redFlagTaken) || (self.team === BLUE_TEAM && tagpro.ui.blueFlagTaken);
    }

    /*
     * Returns true if tileID is traversable without consequences.
     *
     * Traversable includes: regular floor, all flags, inactive speedpad,
     *   inactive gate, friendly gate, inactive bomb, teamtiles, inactive
     *   portal, endzones
     * Untraversable includes: empty space, walls, active speedpad, any
     *   powerup, spike, button, enemy/green gate, bomb, active portal
     */
    function isTraversable(tileID) {
        switch (tileID) {
            case tileTypes.REGULAR_FLOOR:
            case tileTypes.RED_FLAG:
            case tileTypes.RED_FLAG_TAKEN:
            case tileTypes.BLUE_FLAG:
            case tileTypes.BLUE_FLAG_TAKEN:
            case tileTypes.SPEEDPAD_INACTIVE:
            case tileTypes.INACTIVE_GATE:
            case tileTypes.INACTIVE_BOMB:
            case tileTypes.RED_TEAMTILE:
            case tileTypes.BLUE_TEAMTILE:
            case tileTypes.INACTIVE_PORTAL:
            case tileTypes.SPEEDPAD_RED_INACTIVE:
            case tileTypes.SPEEDPAD_BLUE_INACTIVE:
            case tileTypes.YELLOW_FLAG:
            case tileTypes.YELLOW_FLAG_TAKEN:
            case tileTypes.RED_ENDZONE:
            case tileTypes.BLUE_ENDZONE:
            case 'blueball':
            case 'redball':
                return true;
            case tileTypes.EMPTY_SPACE:
            case tileTypes.SQUARE_WALL:
            case tileTypes.ANGLE_WALL_1:
            case tileTypes.ANGLE_WALL_2:
            case tileTypes.ANGLE_WALL_3:
            case tileTypes.ANGLE_WALL_4:
            case tileTypes.SPEEDPAD_ACTIVE:
            case tileTypes.POWERUP_SUBGROUP:
            case tileTypes.JUKEJUICE:
            case tileTypes.ROLLING_BOMB:
            case tileTypes.TAGPRO:
            case tileTypes.MAX_SPEED:
            case tileTypes.SPIKE:
            case tileTypes.BUTTON:
            case tileTypes.GREEN_GATE:
            case tileTypes.BOMB:
            case tileTypes.ACTIVE_PORTAL:
            case tileTypes.SPEEDPAD_RED_ACTIVE:
            case tileTypes.SPEEDPAD_BLUE_ACTIVE:
                return false;
            case tileTypes.RED_GATE:
                return self.team === RED_TEAM;
            case tileTypes.BLUE_GATE:
                return self.team === BLUE_TEAM;
            default:
                return false;
        }
    }

    /*
     * Returns a 2D array of traversable (1) and blocked (0) tiles.
     *
     * The 2D array is an array of the columns in the game. empty_tiles[0] is
     * the left-most column. Each column array is an array of the tiles in
     * that column, with 1s and 0s.  empty_tiles[0][0] is the upper-left corner
     * tile.
     */
    function getTraversableTiles() {
        var xl = tagpro.map.length,
            yl = tagpro.map[0].length,
            empty_tiles = [];

        for (var x = 0; x < xl; x++) {
            empty_tiles[x] = new Array(yl);
            for (var y = 0; y < yl; y++) {
                empty_tiles[x][y] = isTraversable(tagpro.map[x][y]) ? 1 : 0;
            }
        }
        // console.log(empty_tiles);
        return empty_tiles;
    }
  
    var getTarget = function (my_x, my_y, target_x, target_y, grid) {
        // TODO: handle edge cases regarding target and current position
        mypos = {x: my_x, y: my_y};
        var graph = new Graph(grid, {diagonal: true});
        var start = graph.grid[my_x][my_y];
        var end = graph.grid[target_x][target_y];
        var shortest_path = astar.search(graph, start, end, { heuristic: astar.heuristics.diagonal });
        // var shortest_path = astar.search(graph, start, end);
        var next = shortest_path[0];
        res = {x: next.x, y: next.y};
        return res;
    };
  
    // Stole this function to send chat messages
    var lastMessage = 0;
    function chat(chatMessage) {
        var limit = 500 + 10;
        var now = new Date();
        var timeDiff = now - lastMessage;
        if (timeDiff > limit) {
            tagpro.socket.emit("chat", {
                message: chatMessage,
                toAll: 0
            });
            lastMessage = new Date();
        } else if (timeDiff >= 0) {
            setTimeout(chat, limit - timeDiff, chatMessage)
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
        window.onkeydown = function(event) {
            if (event.keyCode === 81) {
                AUTONOMOUS = !AUTONOMOUS;
                tagpro.sendKeyPress("up", true);
                tagpro.sendKeyPress("down", true);
                tagpro.sendKeyPress("left", true);
                tagpro.sendKeyPress("right", true);
                if (AUTONOMOUS) {
                    chat("Autonomy Mode updated: now AUTONOMOUS!");
                } else {
                    chat("Autonomy Mode updated: now MANUAL!");
                }
                setTimeout(function() { console.log("Autonomy status: " + AUTONOMOUS); }, 200);
            }
        };

        requestAnimationFrame(main);

        var seek = {},
            goal = null,
            flag = null,
            enemy = enemyFC();

        // If the bot has the flag, go to the endzone
        if (self.flag) {
            var chaser = enemyC();
            // Really bad jukes !!!!! DISABLED FOR NOW
            if (false) {
                goal = chaser;
                goal.x = 2*(self.x + self.vx) - (chaser.x + chaser.vx);
                goal.y = 2*(self.y + self.vy) - (chaser.y + chaser.vy);
                console.log("I have the flag. Fleeing enemy!");
            // Really bad caps
            } else {
                goal = findEndzone();
                console.log("I have the flag. Seeking endzone!");
            }
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

        // Version for attempting path-planning
        var gridPosition = { x: Math.floor((self.x+20) / 40), y: Math.floor((self.y+20) / 40) };
        var gridTarget = { x: Math.floor(goal.x / 40), y: Math.floor(goal.y / 40) };
        var nearGoal = getTarget(gridPosition.x, gridPosition.y,
                                 gridTarget.x, gridTarget.y,
                                 getTraversableTiles());
        nearGoal.x = nearGoal.x * 40;
        nearGoal.y = nearGoal.y * 40;

        seek.x = nearGoal.x - (self.x + self.vx);
        seek.y = nearGoal.y - (self.y + self.vy);


        // Version for not attempting path-planning
        // seek.x = goal.x - (self.x + self.vx);
        // seek.y = goal.y - (self.y + self.vy);
        if (AUTONOMOUS){
            move(seek);
        }
    }

    main();
}
// Initialize the script when tagpro is ready, and additionally wait
// for the playerId property to be assigned.
tagpro.ready(function () {
    waitForId(script);
});
