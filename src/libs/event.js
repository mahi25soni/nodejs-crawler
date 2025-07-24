import EventEmitter from "events";
import {
  runCorpusWordQueue,
  runInvertedIndexQueue,
  runUrlPendingQueue,
} from "../controllers/handlingQueue.controller.js";
import globalState from "./globalState.js";
export let eventEmitter = new EventEmitter();

eventEmitter.on("hit-url-pending-queue", () => {
  console.log("event hit-url-pending-queue hit");
  runUrlPendingQueue();
});

eventEmitter.on("hit-corpus-word-queue", () => {
  console.log("event hit-corpus-word-queue hit");

  globalState.setRunCorpusWordQueue = true;
  runCorpusWordQueue();
});

eventEmitter.on("hit-inverted-index-queue", () => {
  console.log("event hit-inverted-index-queue hit");
  globalState.setRunInvertedIndexQueue = true;
  runInvertedIndexQueue();
});
