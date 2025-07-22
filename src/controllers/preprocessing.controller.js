import axios from "axios";
import { JSDOM } from "jsdom";
import { removeStopwords, eng } from "stopword";
import natural from "natural"; // Importing natural for potential future use
import { unwantedTags, webStopwords } from "../common/constant.js";

export const fetchSiteData = async (req, res) => {
  try {
    const seedUrl = req.body.seedUrl;
    const response = await axios.get(seedUrl);
    const rawHtmlData = response.data;

    const dom = new JSDOM(rawHtmlData);
    const document = dom.window.document;

    // Remove unwanted elements

    unwantedTags.forEach((tag) =>
      document.querySelectorAll(tag).forEach((el) => el.remove())
    );

    // Get text content only
    const rawText = document.body.textContent || "";

    let normalized = rawText
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, "")
      // Remove email addresses
      .replace(/\S+@\S+\.\S+/g, "")
      // Remove special characters but preserve hyphens in compound words
      .replace(/[^\w\s\-']/g, " ")
      // Handle contractions properly
      .replace(/(\w)'(\w)/g, "$1$2") // don't -> dont
      // Normalize hyphens
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

    // Remove stopwords
    const filteredWords = removeStopwords(words, eng);

    // Remove common web-specific words
    const finalsetup = filteredWords.filter(
      (word) => !webStopwords.includes(word)
    );

    const stemmedWords = finalsetup.map((word) =>
      natural.PorterStemmer.stem(word)
    );

    return res.status(200).json({
      message: "Site data fetched successfully",
      data: stemmedWords,
    });
  } catch (error) {
    console.error("Error fetching seed URL:", error);
    res.status(500).send("Error fetching seed URL");
  }
};
