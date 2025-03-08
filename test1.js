// export { default as foo } from "./test2.js";
// export { test2 as bar } from "./test2.js";


// x = 13;

// export const fun = (c) => { c(fun); x = 14; };
// export { fun as foo };
// export { fun as bar };

// export * from "test2.js";
// export default 111;

import { x } from "test2.js";

x();

export const remoteObj = {
  y: {
    z: 100
  }
};