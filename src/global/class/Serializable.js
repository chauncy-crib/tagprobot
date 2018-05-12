import { assert } from '../../global/utils';


/**
 * A class representing an object which can be serialized/deserialized to/from a JSON object.
 *   Assuming Cat extends Serializable, and has some method Cat.meow(), an example:
 *
 *     const timmy = new Cat("timmy");
 *     timmy.meow();
 *     // Save timmy
 *     const s = JSON.stringify(timmy);
 *     // Some code later
 *     const cat = (new Cat()).fromObject(JSON.parse(s));
 *     cat.meow() // should work
 *     console.log(cat) // should print "timmy"
 */
export class Serializable {
  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  constructor() {
    assert(new.target !== Serializable, 'Serializable object cannot be initialized directly');
  }

  /**
   * This function deserializes the input object into this object, assigning all data from the
   *   object to this object's fields.
   * @param {Object} obj - an object return by JSON.parse()
   */
  fromObject(obj) {
    assert(false, 'Method not implemented');
    return this;
  }
  /* eslint-enable class-methods-use-this */
  /* eslint-enable no-unused-vars */
}
