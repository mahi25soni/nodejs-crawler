import { eventEmitter } from "../libs/event";
import globalState from "../libs/globalState";
import {
  handleCorpusWord,
  handleCrawledSite,
  handleInvertedIndex,
} from "./preprocessing.controller";

export const runUrlPendingQueue = async () => {
  try {
    while (
      !globalState.globalUrlPendingQueue.isEmpty() &&
      globalState.globalSiteCrawled <= 5
    ) {
      const front = globalUrlPendingQueue.pop(); // removes the first element

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
  } catch (error) {
    throw new Error(error);
  }
};

export const runCorpusWordQueue = async () => {
  try {
    while (!globalState.corpusWordQueue.isEmpty()) {
      const front = globalState.corpusWordQueue.pop();
      await handleCorpusWord(front.inputData);
    }
    globalState.setRunCorpusWordQueue = false;
  } catch (error) {
    throw new Error(error);
  }
};

export const runInvertedIndexQueue = async () => {
  try {
    while (!globalState.invertedIndexQueue.isEmpty()) {
      const front = globalState.invertedIndexQueue.pop();
      await handleInvertedIndex(front.inputData, front.crawledSiteId);
    }
    globalState.setRunInvertedIndexQueue = false;
  } catch (error) {
    throw new Error(error);
  }
};
