import { Queue } from "@datastructures-js/queue";

class GlobalState {
  globalUrlPendingQueue = new Queue();

  corpusWordQueue = new Queue();

  setRunCorpusWordQueue = false;

  invertedIndexQueue = new Queue();

  setRunInvertedIndexQueue = false;

  globalSiteCrawled = 0;
}

export default new GlobalState();
