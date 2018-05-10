import { assert } from '../../global/utils';


/**
 * A class representing an object which can be serialized/deserialized to/from a file. Usage
 * would look like (assuming Cat extends Serializable, and has some method Cat.meow())
 *
 * const timmy = new Cat("timmy");
 * timmy.meow();
 * // Save timmy
 * timmy.serialize('timmy.json');
 * // Some code later
 * const cat = (new Cat()).deserialize('timmy.json');
 * cat.meow() // should work
 * console.log(cat) // should print "timmy"
 */
export class Serializable {
  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  constructor() {
    assert(new.target !== Serializable, 'Serializable object cannot be initialized directly');
  }

  /**
   * @param {string} filename - the file to serialize this object to
   */
  serialize(filename) { //
    assert(false, 'Method not implemented');
  }


  /**
   * This function deserializes the string into this object, assigning all data from the file to
   *   this object's fields.
   * @param {string} filename - a file containing a string produced by calling serialize() on an
   *   object of this class
   * @returns {Serializable} an object of this class (should simply return this)
   */
  deserialize(filename) {
    assert(false, 'Method not implemented');
    return this;
  }
  /* eslint-enable class-methods-use-this */
  /* eslint-enable no-unused-vars */
}
