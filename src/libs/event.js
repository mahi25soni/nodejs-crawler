import EventEmitter from "events";
import { Worker } from "worker_threads";
import {
  runCorpusWordQueue,
  runInvertedIndexQueue,
  runUrlPendingQueue,
} from "../controllers/handlingQueue.controller.js";
import globalState from "./globalState.js";

export let eventEmitter = new EventEmitter();

eventEmitter.on("hit-url-pending-queue", () => {
  runUrlPendingQueue();
});

eventEmitter.on("hit-corpus-word-queue", () => {
  globalState.setRunCorpusWordQueue = true;
  runCorpusWordQueue();
});

eventEmitter.on("hit-inverted-index-queue", () => {
  globalState.setRunInvertedIndexQueue = true;
  runInvertedIndexQueue();
});
