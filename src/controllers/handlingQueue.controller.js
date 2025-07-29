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
    while (
      !globalState.globalUrlPendingQueue.isEmpty() &&
      globalState.globalSiteCrawled <= 50
    ) {
      const front = globalState.globalUrlPendingQueue.pop(); // removes the first element

      const data = await handleCrawledSite(front);
      if (data.success) {
        globalState.corpusWordQueue
          .push({
            inputData: data?.data?.textTokens,
            type: "BASIC_TOKEN",
          })
          .push({
            inputData: data?.data?.pageTitle,
            type: "PAGETITLE",
          })
          .push({
            inputData: data?.data?.metaKeywords,
            type: "KEYWORD",
          })
          .push({
            inputData: data?.data?.htmlHeaders?.h1,
            type: "HONE",
          })
          .push({
            inputData: data?.data?.htmlHeaders?.h2,
            type: "HTWO",
          })
          .push({
            inputData: data?.data?.htmlHeaders?.h3,
            type: "HTHREE",
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
      await handleCorpusWord(front.inputData, front.type);
    }
    globalState.setRunCorpusWordQueue = false;
    temtTime.endingCorpusQueueTime = Date.now();
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
    temtTime.endingIndeQueueTime = Date.now();
  } catch (error) {
    throw new Error(error);
  }
};
