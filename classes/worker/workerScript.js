// import { parentPort, workerData } from 'worker_threads';

// const { results, file, projectBase, analyzePath } = workerData;

// // parentPort.postMessage('Some message');

// function processNewImport(results, file, projectBase, analyzePath) {
//   console.log("[WORKER]", file, projectBase, analyzePath)
//   const ext = file.split('.').pop();
//   if (typeof ext === "string") { // This is more or less redundant, but the typesystem cant determine that this is not required
//     if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
//       if (!results.has(file)) {
//         try {
//           const pf = new ProjectFile(file, projectBase, analyzePath)
//           if (!pf) {
//             console.log("[Invalid Project File]", pf)
//           }
//           results.set(file, pf)
//         } catch (e) {
//           return undefined
//         }
//         return results.get(file)
//       } else {
//         return results.get(file)
//       }
//     }
//   }
//   return undefined;
// }

// processNewImport(results, file, projectBase, analyzePath);

// // Notify that the work is done
// parentPort.postMessage('done');


