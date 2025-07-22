import axios from "axios";
import { JSDOM } from "jsdom";
import { removeStopwords, eng } from "stopword";

const fetchSeedUrl = async (seedUrl) => {
  const res = await axios.get(seedUrl);
  const rawHtmlData = res.data;

  const dom = new JSDOM(rawHtmlData);
  const document = dom.window.document;

  // Remove unwanted elements
  const unwantedTags = [
    "script",
    "style",
    "noscript",
    "iframe",
    "embed",
    "object",
    "nav",
    "header",
    "footer",
    "aside",
    ".advertisement",
    ".ad",
    ".sidebar",
    ".menu",
    ".navigation",
    ".breadcrumb",
    ".social",
    ".share",
    ".comment",
    ".popup",
    ".modal",
    ".cookie",
  ];
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
  const webStopwords = [
    "click",
    "here",
    "more",
    "read",
    "see",
    "view",
    "show",
    "hide",
    "menu",
    "home",
    "contact",
    "about",
    "privacy",
    "terms",
    "cookies",
    "subscribe",
    "follow",
    "share",
    "like",
    "tweet",
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "google",
    "search",
    "loading",
    "error",
    "page",
    "website",
    "link",
    "image",
    "photo",
    "video",
    "download",
    "upload",
    "submit",
    "login",
    "register",
    "signup",
    "signin",
    "logout",
    "username",
    "password",
    "email",
    "phone",
    "address",
    "zip",
    "code",
  ];

  const finalsetup = filteredWords.filter(
    (word) => !webStopwords.includes(word)
  );

  // Final output
  console.log("Filtered Words:", finalsetup);
};

// Example usage
const seedUrl =
  "https://www.geeksforgeeks.org/machine-learning/understanding-tf-idf-term-frequency-inverse-document-frequency/";

fetchSeedUrl(seedUrl);
