import { IridiumSEXP } from "../Structural";

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * Compound Assn, first arg is RVAL and rest are targetsz
 *
 */
export class CompoundAssnSEXP extends IridiumSEXP {
  constructor(rval: IridiumSEXP, lval: Array<IridiumSEXP>) {
    super("CompoundAssn");
    this.args.push(rval);
    for (let t of lval) {
      this.args.push(t);
    }
  }
}
