import { PPCL, BRP } from '../constants';
import { init2dArray } from '../utils/mapUtils';
import { findTile } from './finders';


let currGameIsCenterFlag;


/**
 * Creates the nontraversable kernel that we apply to each nontraversable cell on the
 *   map such that our bot will not bump into things. In other words, the bot doesn't acccount for
 *   its own nonzero radius, and this creates a buffer around nontraversable objects such that the
 *   bot can continue to not account for its radius.
 * @returns {number[][]} the nontraversable kernel
 */
export function getNTKernel() { // eslint-disable-line import/prefer-default-export
  // How big should the NT buffer around the ball's center pixel be in relation to ball's radius?
  // If this value is 1.0, then there will be at least a 19 pixel buffer around the ball's center
  // pixel, because Math.ceil(19 * 1.0) = 19
  const ratioKernelToBall = 1.0;
  const kernelRadiusPixels = Math.ceil(BRP * ratioKernelToBall) + (PPCL / 2);
  const kernelDiameterPixels = 2 * kernelRadiusPixels;
  // This value must be odd, because it represents the dimensions of the NT_KERNEL
  const kernelDiameterCellsTemp = Math.ceil(kernelDiameterPixels / PPCL);
  const kernelDiameterCells = kernelDiameterCellsTemp % 2 === 1
    ? kernelDiameterCellsTemp
    : kernelDiameterCellsTemp + 1;
  const kernel = init2dArray(kernelDiameterCells, kernelDiameterCells, 0);
  const midCell = (kernelDiameterCells - 1) / 2;
  for (let xc = 0; xc < kernelDiameterCells; xc++) {
    for (let yc = 0; yc < kernelDiameterCells; yc++) {
      const xDiff = Math.max(Math.abs(xc - midCell) - 0.5, 0);
      const yDiff = Math.max(Math.abs(yc - midCell) - 0.5, 0);
      const cellDist = Math.sqrt((xDiff ** 2) + (yDiff ** 2));
      const pixelDist = cellDist * PPCL;
      if (pixelDist <= kernelRadiusPixels) {
        kernel[xc][yc] = 1;
      }
    }
  }
  return kernel;
}

export function setupIsCenterFlag() {
  currGameIsCenterFlag = findTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']) !== null;
}

export function isCenterFlag() {
  return currGameIsCenterFlag;
}
