import { workerData, parentPort } from "worker_threads"; // loads worker thread

// parentPort.postMessage(`${workerData?.name}? You sent this?`);

parentPort.on("message", (number) => {
  const theSquare = number * number;
  const data = `Square of ${number} : ${theSquare}`;
  parentPort.postMessage(data);
});
