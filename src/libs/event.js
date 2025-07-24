import EventEmitter from "events";
import {
  runCorpusWordQueue,
  runInvertedIndexQueue,
  runUrlPendingQueue,
} from "../controllers/handlingQueue.controller";
import globalState from "./globalState";
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
