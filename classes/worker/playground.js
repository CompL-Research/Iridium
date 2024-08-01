import { Server } from "socket.io";
import { parentPort, workerData } from 'worker_threads';

// 
// Spawing the playground process in a separate thread
// 
// debugConfig.logger.log(`[Starting Playground]`)
// const workerPath = '/home/meetesh/wd/Iridium/classes/worker/playground.js'; // Path to the worker file
// const worker = new Worker(workerPath, { workerData: { project, debugConfig } });

// worker.on('message', (msg) => {
//   debugConfig.logger.log("[WORKER MESSAGE]", msg)
// });

// worker.on('error', (e) => {
//   debugConfig.logger.error("Worker responded [error]", [e])
// });
// worker.on('exit', (code) => {
//   if (code !== 0) {
//     debugConfig.logger.error(`Worker stopped with error code ${code}`)
//   }
// });

const { project, debugConfig } = workerData; // <- This is buggy, we get the old data for some reason

function startPlayground() {
  console.log("[PLAYGROUND WORKER] starting playground")
  const port = debugConfig.playgroundPort
  const io = new Server({
    connectionStateRecovery: {}
  });

  const clientList = {}

  io.on("connection", (socket) => {
    console.log(`[IRIDIUM PLAYGROUND] Connected to a remote client ${socket.id}`)
    clientList[socket.id] = true

    socket.on('disconnect', function () {
      clientList[socket.id] = false
      let activeClients = Object.values(clientList).filter(e => e == true).length

      console.log(`[IRIDIUM PLAYGROUND] Client disconnected ${socket.id} [${activeClients} active]`)
    });

    socket.on("get-log-data", (dataLen) => {
      if (dataLen === debugConfig.logger.logData.length) {
        console.log(`[IRIDIUM PLAYGROUND] Latest logdata on ${socket.id}`)
      } else {
        console.log(`[IRIDIUM PLAYGROUND] Sending logdata ==> ${socket.id}`)
        socket.emit("log-data-delivery", debugConfig.logger.logData)
      }
    });

    socket.on("get-imports-graph", (dataLen) => {
      if (project.importsGraphProcessed) {
        const res = project.importsGraph.getDOT()
        socket.emit("imports-graph-delivery", res)
      } else {
        console.log("Imports graph is not yet ready!")
      }
    });

  });

  io.listen(port);
  console.log(`[PLAYGROUND WORKER] Listening on port: ${port}`)
}

startPlayground();

// Notify that the work is done
parentPort.postMessage('[PLAYGROUND WORKER] playground started');


