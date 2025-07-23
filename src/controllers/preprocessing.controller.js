import axios from "axios";
import { JSDOM } from "jsdom";
import { removeStopwords, eng } from "stopword";
import natural from "natural"; // Importing natural for potential future use
import { unwantedTags, webStopwords } from "../common/constant.js";

// for h1, h2, h3,
const arrayOfSentenceToData = (textArray) => {
  const withStopWords = Array.from(textArray)
    .map((el) => el.textContent.trim().toLowerCase().split(" "))
    .flat()
    .map((word) => natural.PorterStemmer.stem(word));
  return removeStopwords(withStopWords, eng);
};

const stringToData = (text) => {
  const words = text
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => natural.PorterStemmer.stem(word));
  return removeStopwords(words, eng);
};

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

    const metaTags = document.querySelectorAll("meta");
    const metadata = {};
    metaTags.forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    // console.log("title ", stringToData(metadata["og:title"]));
    // console.log("site name ", metadata["og:site_name"].trim().toLowerCase());
    // console.log("description ", stringToData(metadata.description));
    // console.log("keywords ", stringToData(metadata.keywords));

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

    // Extract outbound links
    const outboundLinks = Array.from(document.querySelectorAll("a"))
      .map((link) => link.href)
      .filter((href) => href.startsWith("https://"));

    console.log("total links ", outboundLinks.length);
    console.log("outbound links ", outboundLinks);
    return res.status(200).json({
      message: "Site data fetched successfully",
      // data: stemmedWords,
    });
  } catch (error) {
    console.error("Error fetching seed URL:", error);
    res.status(500).send("Error fetching seed URL");
  }
};
