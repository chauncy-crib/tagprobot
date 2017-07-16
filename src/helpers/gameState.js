import { amBlue } from './player';

export function myTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByBlue
    : tagpro.ui.yellowFlagTakenByRed;
}

export function enemyTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByRed
    : tagpro.ui.yellowFlagTakenByBlue;
}
