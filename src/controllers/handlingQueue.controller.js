import { eventEmitter } from "../libs/event.js";
import globalState from "../libs/globalState.js";
import {
  handleCorpusWord,
  handleCrawledSite,
  handleInvertedIndex,
} from "./preprocessing.controller.js";

export const runUrlPendingQueue = async () => {
  try {
    console.log("queue function runUrlPendingQueue started");
    while (
      !globalState.globalUrlPendingQueue.isEmpty() &&
      globalState.globalSiteCrawled <= 5
    ) {
      console.log("iteration inside runUrlPendingQueue");
      const front = globalState.globalUrlPendingQueue.pop(); // removes the first element

      const data = await handleCrawledSite(front);

      if (data.success) {
        globalState.corpusWordQueue.push({
          inputData: data?.data?.textTokens,
        });
        if (!globalState.setRunCorpusWordQueue) {
          eventEmitter.emit("hit-corpus-word-queue");
        }

        globalState.invertedIndexQueue.push({
          inputData: data?.data?.textTokens,
          crawledSiteId: data?.data?._id,
        });
        if (!globalState.setRunInvertedIndexQueue) {
          eventEmitter.emit("hit-inverted-index-queue");
        }
      }
    }
    console.log(":::: EMPTY URL PENDING :::::");
  } catch (error) {
    throw new Error(error);
  }
};

export const runCorpusWordQueue = async () => {
  try {
    console.log("queue function runCorpusWordQueue started");

    while (!globalState.corpusWordQueue.isEmpty()) {
      console.log("-------------- iteration inside runCorpusWordQueue");

      const front = globalState.corpusWordQueue.pop();
      await handleCorpusWord(front.inputData);
    }
    globalState.setRunCorpusWordQueue = false;
    console.log(":::: EMPTY CORPUS WORD :::::");
  } catch (error) {
    throw new Error(error);
  }
};

export const runInvertedIndexQueue = async () => {
  try {
    console.log("queue function runInvertedIndexQueue started");

    while (!globalState.invertedIndexQueue.isEmpty()) {
      console.log("-------------- iteration inside runInvertedIndexQueue");
      const front = globalState.invertedIndexQueue.pop();
      await handleInvertedIndex(front.inputData, front.crawledSiteId);
    }
    globalState.setRunInvertedIndexQueue = false;
    console.log(":::: EMPTY INVERT QUEUE :::::");
  } catch (error) {
    throw new Error(error);
  }
};
