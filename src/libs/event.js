import EventEmitter from "events";
import { Worker } from "worker_threads";
import {
  runCorpusWordQueue,
  runInvertedIndexQueue,
  runUrlPendingQueue,
} from "../controllers/handlingQueue.controller.js";
import globalState from "./globalState.js";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export let eventEmitter = new EventEmitter();

eventEmitter.on("hit-url-pending-queue", () => {
  console.log("event hit-url-pending-queue hit");
  runUrlPendingQueue();
});

let corpusWorkerRunning = false;
eventEmitter.on("hit-corpus-word-queue", () => {
  console.log(
    "Current size of corpus queue ",
    globalState.corpusWordQueue.size()
  );

  if (corpusWorkerRunning) {
    console.log("Corpus worker already running, skipping...");
    return;
  }

  console.log("Size in the same process ", globalState.corpusWordQueue.size());
  console.log("⚡ Triggering corpus worker");

  const corpusWorkerFile = path.join(
    __dirname,
    "../parallelProcessing/corpusWorker.js"
  );

  const corpusWorker = new Worker(corpusWorkerFile);
  corpusWorkerRunning = true;

  if (corpusWorker && globalState.corpusWordQueue.size() > 0) {
    const nextItem = globalState.corpusWordQueue.dequeue();
    corpusWorker.postMessage(nextItem);
  }

  corpusWorker.on("message", (message) => {
    if (message === "ready-for-next") {
      console.log("NEW----- Corpus input demanded.");
      const nextItem = globalState.corpusWordQueue.dequeue();
      if (nextItem) {
        corpusWorker.postMessage(nextItem);
      } else {
        // Optionally wait until next event
        corpusWorkerRunning = false;
      }
    }
  });

  corpusWorker.on("error", (err) => {
    corpusWorkerRunning = false;
    console.error(" Error in corpus worker:", err);
  });

  corpusWorker.on("exit", (code) => {
    corpusWorkerRunning = false;
    console.log(`Corpus worker exited with code: ${code}`);
  });
});

let invertedWorkerRunning = false;
eventEmitter.on("hit-inverted-index-queue", () => {
  console.log(
    "Current size of inverted queue ",
    globalState.invertedIndexQueue.size()
  );
  if (invertedWorkerRunning) {
    console.log("Inverted index worker already running, skipping...");
    return;
  }

  console.log("⚡ Triggering inverted index worker");

  const invertedWorkerFile = path.join(
    __dirname,
    "../parallelProcessing/indexWorker.js"
  );

  const invertedWorker = new Worker(invertedWorkerFile);
  invertedWorkerRunning = true;

  if (invertedWorker && globalState.invertedIndexQueue.size() > 0) {
    const nextItem = globalState.invertedIndexQueue.pop();
    invertedWorker.postMessage(nextItem);
  }

  invertedWorker.on("message", (message) => {
    if (message === "ready-for-next") {
      console.log("NEW----- Index input demanded.");
      const nextItem = globalState.invertedIndexQueue.pop();
      if (nextItem) {
        invertedWorker.postMessage(nextItem);
      } else {
        invertedWorkerRunning = false;
      }
    }
  });

  invertedWorker.on("error", (err) => {
    invertedWorkerRunning = false;
    console.error("❌ Error in inverted index worker:", err);
  });

  invertedWorker.on("exit", (code) => {
    invertedWorkerRunning = false;
    console.log(`🔚 Inverted index worker exited with code: ${code}`);
  });
});
