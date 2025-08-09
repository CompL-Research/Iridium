import { IridiumSEXP } from "../../Structural/General";
/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * When instantiating an object of a JSClass, if the class happens to use private methods, 
 * we must register a brand (a unique symbol) with it.
 * This brand check ensures that the private symbol/method being referenced is valid in the scope.
 * If the brand of the object instance and the private method being referenced fail the brand check, 
 * a runtime error is thrown.
 * 
 * > add a private brand field to 'home_obj' if not already present and if obj is != null add a private brand to it
 * 
 * One may imagine this to be a way to push the class encapsulation check to the runtime; 
 * contrary to languages like Java/C++ where it might be a static compile time check.
 * 
 * #### Trigger
 * 
 * ```
 * class Test { #foo() { } }
 * ```
 * 
 * #### Further
 * 
 * This instruction is added at the end of the class property init closure (a closure used to 
 * initialize the fields of a new object instance).
 * This may be skipped, if there are no private symbols or the check can be proved to be redundant statically.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object instance.
 * 
 * - `ARG(homeObj)`: The home object.
 * 
 */
export class JSADDBRANDSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, homeObj: IridiumSEXP) {
    super("JSADDBRAND");
    this.setObj(obj);
    this.setHomeObj(homeObj);
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj(): IridiumSEXP {
    return this.args[0];
  }

  setHomeObj(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getHomeObj(): IridiumSEXP {
    return this.args[1];
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @category TODO
 * 
 * @remarks
 * 
 * Checks if the function (constructor in this case) was called using the `new` keyword.
 * If not, then it throws an error.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * 
 * #### Trigger
 * 
 * ```
 * class Test { }
 * ```
 */
export class JSCheckConstructorSEXP extends IridiumSEXP {
  constructor() {
    super("JSCheckConstructor");
  }
}