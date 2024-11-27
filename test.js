// 1.
import "source";
import { x as y } from "source";
import * as x from "source";
import z from "source";

// 2.
let ID = 1
let local = 1
export default ID
export { local as remote }
export { local as remote2 } from "FROM"
export * as REMOTE from "FROM"
export * from "FROM"
