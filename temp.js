let exportDefUnnamed$2 = {
  default: () => {
    let js3$1 = console.log("Test");
  }
}.default;
export default exportDefUnnamed$2;
import { default as a } from "./temp.js"; // Resolved: /home/meetesh/wd/Iridium/test.js
let js3$3 = console.log(/*JS3ContainedExprKey*/a.name);
