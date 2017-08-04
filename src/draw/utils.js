/*
 * Iterates over each PIXI.Graphics object in sprites and adds it to the background
 */
export function drawSprites(sprites) {
  sprites.forEach(sprite => {
    tagpro.renderer.layers.background.addChild(sprite);
  });
}


/*
 * Iterates through the sprites provided to the function, and removes them from
 * tagpro.renderer.layers.background. Returns the new sprites object
 */
export function clearSprites(sprites) {
  if (sprites) {
    sprites.forEach(sprite => {
      tagpro.renderer.layers.background.removeChild(sprite);
    });
    return [];
  }
  return sprites;
}
