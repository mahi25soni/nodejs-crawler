import { Worker } from "worker_threads";

function launchWorker(number) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./src/parallelProcessing/worker.js");

    worker.postMessage(number);

    worker.on("message", (data) => resolve(data));
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

(async () => {
  try {
    const final = await launchWorker(13);
    console.log(final);
  } catch (error) {
    console.log("error : ", error);
  }
})();
