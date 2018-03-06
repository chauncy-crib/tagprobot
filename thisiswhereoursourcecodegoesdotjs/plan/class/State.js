import { assert } from '../../global/utils';


export class State {
  /* eslint-disable class-methods-use-this */
  constructor() {
    assert(new.target !== State, 'State object cannot be initialized directly');

    this.g = undefined; // the cost to the current state
    // The estimated total cost from the start state to the target state,
    // Passing through this state.
    this.f = undefined;
    // The GameState we came from
    this.parent = undefined;
  }


  heuristic() {
    assert(false, 'Method not implemented');
  }


  equals() {
    assert(false, 'Method not implemented');
  }


  neighbors() {
    assert(false, 'Method not implemented');
  }
  /* eslint-enable class-methods-use-this */
}
