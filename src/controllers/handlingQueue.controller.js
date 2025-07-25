import { eventEmitter } from "../libs/event.js";
import globalState from "../libs/globalState.js";
import {
  handleCorpusWord,
  handleCrawledSite,
  handleInvertedIndex,
} from "./preprocessing.controller.js";
import temtTime from "../libs/temtTime.js";

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
          crawledSiteId: data?.data?._id.toString(),
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

export const runCorpusWordQueue = async (front) => {
  try {
    console.log("queue function runCorpusWordQueue started");

    await handleCorpusWord(front.inputData);

    temtTime.endingCorpusQueueTime = Date.now();

    console.log("<<<< FINISHED RUNNING CORPUS");
  } catch (error) {
    throw new Error(error);
  }
};

export const runInvertedIndexQueue = async (front) => {
  try {
    console.log("queue function runInvertedIndexQueue started");
    await handleInvertedIndex(front.inputData, front.crawledSiteId);

    temtTime.endingIndeQueueTime = Date.now();
    console.log("<<<< FINISHED RUNNING INVERTED INDEX");
  } catch (error) {
    throw new Error(error);
  }
};
