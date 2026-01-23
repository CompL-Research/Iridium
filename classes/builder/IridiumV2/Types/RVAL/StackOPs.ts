import { IridiumSEXP } from "../Structural";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Retain N values on the theoretical stack obtained after evaluation of the given Node.
 * Also can take a value for M (nip), which specify how many values below the top retained values need to be removed.
 * 
 * ```
 * N = 2, M = 0
 * INITIAL : a b <- top
 * FINAL   : a b
 * 
 * N = 2, M = 1
 * INITIAL : a b c <- top
 * FINAL   : b c
 * ```
 * 
 * #### Structure
 * 
 * - `...ARG(Node)`: Node(s) to be evaluated (one or more).
 * 
 * - `FLAG(NVAL : number)`: Number of VALUES pushed onto the stack.
 * 
 * - `FLAG(NIP : number)`: Remove values that occur after the first NVAL.
 * 
 */
export class StackRetainSEXP extends IridiumSEXP {
  constructor(node: IridiumSEXP, nVal: number, nip: number = 0) {
    super("StackRetain");
    this.setNode(node)
    this.setNVal(nVal);
    this.setNip(nip);
  }

  // Args
  setNode(node: IridiumSEXP) {
    this.args[0] = node;
  }

  getNode(): IridiumSEXP {
    return this.args[0];
  }

  // Flags
  setNVal(nVal: number) {
    this.setFlag("NVAL", nVal);
  }

  getNVal(): number {
    return this.getFlagNumber("NVAL");
  }

  setNip(nip: number) {
    this.setFlag("NIP", nip);
  }

  getNip(): number {
    return this.getFlagNumber("NIP");
  }

}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Reject/Discard N values on the theoretical stack (optionally ones obtained after evaluation of the given Node).
 * 
 * #### Structure
 * 
 * - `...ARG(Node)?`: Node(s) to be evaluated (can also be empty).
 * 
 * - `FLAG(NVAL : number)`: Number of VALUES to be popped.
 * 
 */
export class StackRejectSEXP extends IridiumSEXP {
  constructor(node: IridiumSEXP | null = null, nVal: number) {
    super("StackReject");
    if (node) this.pushNode(node)
    this.setNVal(nVal);
  }

  // Args
  pushNode(node: IridiumSEXP) {
    this.args.push(node);
  }

  // Flags
  setNVal(nVal: number) {
    this.setFlag("NVAL", nVal);
  }

  getNVal(): number {
    return this.getFlagNumber("NVAL");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Pop and return the top of the stack.
 * 
 */
export class StackPopSEXP extends IridiumSEXP {
  constructor() {
    super("StackPop");
  }
}
