import { COLORS, ALPHAS, THICKNESSES } from './constants';
import { drawArrow } from './arrow';


let localGoalGraphics = null; // PIXI Graphics for drawing the bot's local goal
let localGoalOn = false; // whether or not the local goal is currently being drawn


export function drawLocalGoal(localGoal) {
  if (!localGoalOn) return;
  if (!localGoalGraphics) {
    localGoalGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(localGoalGraphics);
  }
  localGoalGraphics.clear();
  const { x, y, vx, vy } = localGoal;
  drawArrow(
    localGoalGraphics,
    THICKNESSES.localGoal,
    COLORS.localGoal,
    ALPHAS.localGoal,
    x,
    y,
    vx,
    vy,
  );
}


export function toggleLocalGoalVis(setTo = !localGoalOn) {
  if (setTo === localGoalOn) return;
  localGoalOn = setTo;
  if (!localGoalOn) {
    localGoalGraphics.clear();
  }
}
