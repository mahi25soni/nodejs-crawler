import axios from "axios";
import { JSDOM } from "jsdom";
import { removeStopwords, eng } from "stopword";
import natural from "natural"; // Importing natural for potential future use
import { unwantedTags, webStopwords } from "../common/constant.js";
import normalizeUrl from "normalize-url";
import CrawledSite from "../models/crawledSite.model.js";
import CorpusWordStat from "../models/corpusWordStat.model.js";
import InvertedIndex from "../models/invertedIndex.model.js";
import globalState from "../libs/globalState.js";
import temtTime from "../libs/temtTime.js";
import { eventEmitter } from "../libs/event.js";
import pLimit from "p-limit";

const limit = pLimit(50);

// for h1, h2, h3,
const arrayOfSentenceToData = (textArray) => {
  if (textArray?.length < 1) {
    return [];
  }
  const withStopWords = Array.from(textArray)
    .map((el) => el.textContent.trim().toLowerCase().split(" "))
    .flat()
    .map((word) => natural.PorterStemmer.stem(word));
  return removeStopwords(withStopWords, eng);
};

const stringToData = (text) => {
  if (text === undefined || text === null) {
    return [];
  }
  const words = text
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => natural.PorterStemmer.stem(word));
  return removeStopwords(words, eng);
};

const normliseIncomingUrl = (url) => {
  const normalized = normalizeUrl(url, {
    stripHash: true, // Removes the URL fragment (#section)
    removeTrailingSlash: true, // Removes trailing slash (unless root)
    removeDirectoryIndex: true, // Removes common directory index files (like index.html)
    sortQueryParameters: true, // Sorts query parameters alphabetically
    stripWWW: true,
    normalizeProtocol: true, // Converts 'https://www...' to lowercase 'https://...'
    defaultProtocol: "https:", // Ensures a protocol is always present (default is 'http:')
  });

  return normalized;
};
export const fetchSiteData = async (req, res) => {
  try {
    const normalizedSeedUrl = normliseIncomingUrl(req.body.seedUrl);
    globalState.globalUrlPendingQueue.enqueue(normalizedSeedUrl);
    2525;

    temtTime.apiStartTime = Date.now();
    eventEmitter.emit("hit-url-pending-queue");

    return res.status(200).json({
      message: "Events started",
    });
  } catch (error) {
    console.error("Error fetching seed URL:", error);
    res.status(500).send("Error fetching seed URL");
  }
};

export const handleCrawledSite = async (seedUrl) => {
  try {
    // console.time(`<<<<<< Process api:`);
    const normalizedSeedUrl = normliseIncomingUrl(seedUrl);

    console.log("=== Current site is : ", normalizedSeedUrl);
    console.log("--------URL COUNT IS : ", globalState.globalSiteCrawled);

    const existingCrawledSite = await CrawledSite.findOne({
      url: normalizedSeedUrl,
    });

    if (existingCrawledSite?.isCrawled) {
      return {
        success: false,
      };
    }

    const response = await axios.get(normalizedSeedUrl);

    const rawHtmlData = response.data;

    const dom = new JSDOM(rawHtmlData);
    const document = dom.window.document;

    // Remove unwanted elements
    unwantedTags.forEach((tag) =>
      document.querySelectorAll(tag).forEach((el) => el.remove())
    );

    const metaTags = document.querySelectorAll("meta");
    const metadata = {};
    metaTags.forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    //All H1
    const h1Elements = document.querySelectorAll("h1");
    const h1Data = arrayOfSentenceToData(h1Elements);

    //All H2
    const h2Elements = document.querySelectorAll("h2");
    const h2Data = arrayOfSentenceToData(h2Elements);

    //All H3
    const h3Elements = document.querySelectorAll("h3");
    const h3Data = arrayOfSentenceToData(h3Elements);

    // Get text content only
    const rawText = document.body.textContent || "";

    let normalized = rawText
      .replace(/\s+/g, " ")
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/\S+@\S+\.\S+/g, "")
      .replace(/[^\w\s\-']/g, " ")
      .replace(/(\w)'(\w)/g, "$1$2") // don't -> dont
      .toLowerCase()
      .trim();

    let noway = normalized.split(" ");

    const words = noway.filter((singleword) => {
      if (singleword.length === 1 && !["a", "i"].includes(singleword)) {
        return false;
      }
      if (singleword.length < 2) {
        return false;
      }
      return true;
    });

    const contentWords = removeStopwords(words, eng);

    // Remove web-specific stopwords
    const filteredContentWords = contentWords.filter(
      (word) => !webStopwords.includes(word)
    );

    const stemmedContentWords = filteredContentWords.map((word) =>
      natural.PorterStemmer.stem(word)
    );

    const outboundLinks = Array.from(document.querySelectorAll("a"))
      .map((link) => link.getAttribute("href") || "")
      .filter((href) => href.startsWith("https")) // only absolute URLs
      .map((href) => normalizeUrl(href))
      .filter((href) => href && href.includes("geeksforgeeks.org"));

    const newCrawledSiteData = {
      url: normalizedSeedUrl,
      siteName: metadata["og:site_name"]?.trim().toLowerCase() | "",
      pageTitle: stringToData(metadata["og:title"]),
      metaDescription: stringToData(metadata.description),
      metaKeywords: stringToData(metadata.keywords),
      outboundLinks: outboundLinks,
      htmlHeaders: {
        h1: h1Data,
        h2: h2Data,
        h3: h3Data,
      },
      textTokens: stemmedContentWords,
      isCrawled: true,
    };

    const nCrawledSite = await CrawledSite.create(newCrawledSiteData);

    // pass urls to the globalUrlPendingQueue
    outboundLinks.forEach((link) => {
      globalState.globalUrlPendingQueue.push(link);
    });

    globalState.globalSiteCrawled += 1;

    return {
      success: true,
      data: nCrawledSite.toObject(),
    };
  } catch (error) {
    console.log("Error in handleCrawled :", error);
    throw new Error(error);
  } finally {
    // console.timeEnd(`<<<<<< Process api:`);
  }
};

export const handleCorpusWord = async (inputData) => {
  // console.time(`<<<<<<< Handle Corpus Word:`);
  try {
    const wordOccurance = Object.create(null);
    inputData?.forEach((word) => {
      if (wordOccurance[word]) {
        wordOccurance[word] += 1;
      } else {
        wordOccurance[word] = 1;
      }
    });

    let bulkCreateData = [];
    let bulkUpdateData = [];

    const entireWordList = await CorpusWordStat.find({
      word: { $in: Object.keys(wordOccurance) },
    })
      .select("_id word")
      .lean();

    Object.keys(wordOccurance)?.forEach((word) => {
      const currentCorpusWord = entireWordList.find(
        (element) => element?.word.trim() === word.trim()
      );
      if (currentCorpusWord) {
        bulkUpdateData.push({
          updateOne: {
            filter: { _id: currentCorpusWord?._id },
            update: {
              $inc: { documentFrequency: 1 },
            },
          },
        });
      }
      // The word is not found in the corpus, so we create a new entry
      else {
        bulkCreateData.push({
          word: word,
          documentFrequency: 1,
        });
      }
    });

    const tasks = [];
    if (bulkCreateData.length > 0)
      tasks.push(CorpusWordStat.insertMany(bulkCreateData));

    if (bulkUpdateData.length > 0)
      tasks.push(CorpusWordStat.bulkWrite(bulkUpdateData));

    await Promise.all(tasks);

    return true;
  } catch (error) {
    console.error("Error handling corpus word:", error);
    throw new Error("Error in corpus world");
  } finally {
    // console.timeEnd(`<<<<<<< Handle Corpus Word:`);
  }
};

export const handleInvertedIndex = async (inputData, crawledSiteId) => {
  // console.time(`<<<<<<< Handle Inverted Index:`);

  try {
    const wordOccurance = Object.create(null);
    inputData?.forEach((word) => {
      if (wordOccurance[word]) {
        wordOccurance[word] += 1;
      } else {
        wordOccurance[word] = 1;
      }
    });

    let bulkCreateData = [];
    let bulkUpdateData = [];

    const entireWordList = await InvertedIndex.find({
      word: { $in: Object.keys(wordOccurance) },
    })
      .select("_id word document.siteId")
      .lean();

    Object.keys(wordOccurance).forEach((word) => {
      const currentWord = entireWordList.find(
        (element) => element.word.trim() === word.trim()
      );
      const newDocEntry = {
        siteId: crawledSiteId.toString(),
        termFrequency: wordOccurance[word],
        totalWordsInDoc: inputData.length,
      };

      if (!currentWord) {
        bulkCreateData.push({
          word: word,
          documents: [newDocEntry],
        });
      }
      // word exists already,
      else {
        const fCrawledSite = currentWord?.documents?.some(
          (element) => element.siteId.toString() === crawledSiteId.toString()
        );
        // This site isn't there in documents list of this word
        if (!fCrawledSite) {
          bulkUpdateData.push({
            updateOne: {
              filter: { word },
              update: { $push: { document: newDocEntry } },
            },
          });
        } else {
          // If same site crawled again, we'll update the numbers
          bulkUpdateData.push({
            updateOne: {
              filter: { word, "documents.siteId": crawledSiteId.toString() },
              update: {
                $set: {
                  "documents.$.termFrequency": wordOccurance[word],
                  "documents.$.totalWordsInDoc": inputData.length,
                },
              },
            },
          });
        }
      }
    });

    const tasks = [];
    if (bulkCreateData.length > 0)
      tasks.push(InvertedIndex.insertMany(bulkCreateData));

    if (bulkUpdateData.length > 0)
      tasks.push(InvertedIndex.bulkWrite(bulkUpdateData));

    await Promise.all(tasks);

    return true;
  } catch (error) {
    console.error("Error handling inverted index:", error);
    throw new Error("Error in inverted index");
  } finally {
    // console.timeEnd(`<<<<<<< Handle Inverted Index:`);
  }
};
