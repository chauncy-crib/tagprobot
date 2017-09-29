import { PPCL, BRP } from '../constants';
import { init2dArray } from './map';


/*
 * Creates the nontraversable kernel that we apply to each nontraversable cell on the
 * map such that our bot will not bump into things. In other words, the bot doesn't acccount for
 * its own nonzero radius, and this creates a buffer around nontraversable objects such that the
 * bot can continue to not account for its radius.
 *
 * @returns {number[][]} the nontraversable kernel
 */
export function getNTKernel() { // eslint-disable-line import/prefer-default-export
  // How big should the NT buffer around the ball's center pixel be in relation to ball's radius?
  // If this value is 1.0, then there will be at least a 19 pixel buffer around the ball's center
  // pixel, because Math.ceil(19 * 1.0) = 19
  const ratioNTBufferToBallRadius = 1.0;
  const NTKernelRadiusPixels = Math.ceil(BRP * ratioNTBufferToBallRadius) + (PPCL / 2);
  const NTKernelDiameterPixels = 2 * NTKernelRadiusPixels;
  // This value must be odd, because it represents the dimensions of the NTKernel
  const NTKernelDiameterCellsTemp = Math.ceil(NTKernelDiameterPixels / PPCL);
  const NTKernelDiameterCells = NTKernelDiameterCellsTemp % 2 === 1
    ? NTKernelDiameterCellsTemp
    : NTKernelDiameterCellsTemp + 1;
  const NTKernel = init2dArray(NTKernelDiameterCells, NTKernelDiameterCells, 0);
  const midCell = (NTKernelDiameterCells - 1) / 2;
  for (let xc = 0; xc < NTKernelDiameterCells; xc++) {
    for (let yc = 0; yc < NTKernelDiameterCells; yc++) {
      const xDiff = Math.max(Math.abs(xc - midCell) - 0.5, 0);
      const yDiff = Math.max(Math.abs(yc - midCell) - 0.5, 0);
      const cellDist = Math.sqrt((xDiff ** 2) + (yDiff ** 2));
      const pixelDist = cellDist * PPCL;
      if (pixelDist <= NTKernelRadiusPixels) {
        NTKernel[xc][yc] = 1;
      }
    }
  }
  return NTKernel;
}
