import { removeStopwords, eng } from "stopword";
import natural from "natural";
import CorpusWordStat from "../models/corpusWordStat.model.js";
import InvertedIndex from "../models/invertedIndex.model.js";
import CrawledSite from "../models/crawledSite.model.js";

const preprocessSearchQuery = (query) => {
  try {
    const lowerTrimmedQuery = query.toLowerCase().trim();
    const queryWords = lowerTrimmedQuery.split(" ");
    const filteredStopwords = removeStopwords(queryWords, eng);

    const cleanedWords = filteredStopwords.filter((word) => {
      if (word && word.length < 2) return false;
      return true;
    });

    const stemmedWords = cleanedWords.map((word) =>
      natural.PorterStemmer.stem(word)
    );

    return stemmedWords;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchSite = async (req, res) => {
  try {
    const { searchString } = req.body;
    const stemmedQueryArray = preprocessSearchQuery(searchString);

    const totalDocuments = await CrawledSite.countDocuments();

    const allWordsScore = await Promise.all(
      stemmedQueryArray.map(async (word) => {
        try {
          const corpusEntry = await CorpusWordStat.findOne({
            word: { $regex: new RegExp(`^${word}$`, "i") },
          });

          if (!corpusEntry || !corpusEntry.documentFrequency) {
            console.warn(`⚠️ Word "${word}" not found in CorpusWordStat`);
            return [];
          }

          const IDF = Math.log(totalDocuments / corpusEntry.documentFrequency);

          const invertedIndexEntry = await InvertedIndex.findOne({
            word: { $regex: new RegExp(`^${word}$`, "i") },
          });

          if (!invertedIndexEntry || !invertedIndexEntry.documents?.length) {
            console.warn(`⚠️ No invertedIndex entry for "${word}"`);
            return [];
          }

          // Sort top 10
          invertedIndexEntry.documents = invertedIndexEntry.documents
            .sort((a, b) => b.termFrequency - a.termFrequency)
            .slice(0, 10);

          const listOftf = invertedIndexEntry.documents.map((element) => {
            const frac = element.termFrequency / element.totalWordsInDoc;
            const crossSection = frac * IDF;
            return {
              score: crossSection,
              siteId: element.siteId,
            };
          });

          return listOftf;
        } catch (err) {
          console.error(`❌ Error processing word "${word}":`, err);
          return [];
        }
      })
    );

    const siteToScore = {};

    allWordsScore?.forEach((wordDetails) => {
      wordDetails.forEach((element) => {
        if (siteToScore[element?.siteId]) {
          siteToScore[element?.siteId] += element?.score;
        } else {
          siteToScore[element?.siteId] = element?.score;
        }
      });
    });

    const sortedSiteScores = Object.entries(siteToScore)
      .sort((a, b) => b[1] - a[1])
      .map(([siteId, score]) => ({ siteId, score }));

    const something = await Promise.all(
      sortedSiteScores?.map(async (element) => {
        const siteInfo = await CrawledSite.findOne({
          _id: element?.siteId,
        }).select("url");
        return siteInfo;
      })
    );

    res.status(200).send(something);
  } catch (error) {
    res.status(500).send(error);
  }
};
