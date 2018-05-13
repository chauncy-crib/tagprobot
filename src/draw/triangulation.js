import { getDTGraph } from '../interpret/interpret';


let trianglesOn = false;
let polypointsOn = false;


export function toggleTriangulationVis(setTo = !trianglesOn) {
  if (setTo === trianglesOn) return;
  trianglesOn = setTo;
  if (!trianglesOn) {
    getDTGraph().turnOffDrawings();
  } else {
    getDTGraph().turnOnDrawings();
  }
}


export function togglePolypointVis(setTo = !polypointsOn) {
  if (setTo === polypointsOn) return;
  polypointsOn = setTo;
  if (!polypointsOn) {
    getDTGraph().polypoints.turnOffDrawings();
  } else {
    getDTGraph().polypoints.turnOnDrawings();
  }
}
