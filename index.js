import axios from "axios";
import { parse } from "node-html-parser";

const getHref = (attibuteString) => {
  const startingHttp = attibuteString.lastIndexOf("https://");

  if (startingHttp === -1) {
    return;
  }

  const firstSpace = attibuteString.indexOf(" ", startingHttp);

  let url;

  if (firstSpace === -1) {
    url = attibuteString.substring(startingHttp, attibuteString.length);
  } else {
    url = attibuteString.substring(startingHttp, firstSpace);
  }

  console.log({
    original: attibuteString,
    url: `${url}`,
  });
};

const fetchSeedUrl = async (seedUrl) => {
  const res = await axios.get(seedUrl);
  const rawHtmlData = res.data;

  const parsedData = parse(rawHtmlData);

  const title = parsedData.querySelector("title")?.text || "";

  //   console.log(title);

  //   const metaTags = parsedData.querySelectorAll("meta");

  //   const metadata = {};
  //   metaTags.forEach((meta) => {
  //     const name = meta.getAttribute("name") || meta.getAttribute("property");
  //     const content = meta.getAttribute("content");
  //     if (name && content) metadata[name] = content;
  //   });

  //   console.log("Title:", title);
  //   console.log("Metadata:", metadata);
  //   const anchorTags = parsedData.querySelectorAll("a");

  //   const hrefs = anchorTags
  //     .map((link) => link.getAttribute("href"))
  //     .filter((href) => href && href.startsWith("http"));

  //   console.log("Found links:", hrefs);

  const allH2 = parsedData.querySelectorAll("h2");
  //   console.log(allH1);
  allH2.forEach((ele) => {
    console.log(ele.innerText);
  });

  console.log("------------------------");

  const allH3 = parsedData.querySelectorAll("h3");
  allH3.forEach((ele) => {
    console.log(ele.innerText);
  });

  console.log("------------------------");
  const allH4 = parsedData.querySelectorAll("h4");
  allH4.forEach((ele) => {
    console.log(ele.innerText);
  });
  console.log("------------------------");
  const allH5 = parsedData.querySelectorAll("h5");
  allH5.forEach((ele) => {
    console.log(ele.innerText);
  });
  console.log("------------------------");
  const allH6 = parsedData.querySelectorAll("h6");
  allH6.forEach((ele) => {
    console.log(ele.innerText);
  });

  console.log("--------------------------------------------------");

  const blockTags = [
    "p",
    "div",
    "section",
    "article",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];

  blockTags.forEach((tag) => {
    parsedData.querySelectorAll(tag).forEach((el) => {
      el.insertAdjacentHTML("beforebegin", "\n");
      el.insertAdjacentHTML("afterend", "\n");
    });
  });
  parsedData
    .querySelectorAll("script, style, span")
    .forEach((el) => el.remove());
  const fullText = parsedData.text
    .replace(/\r?\n|\r/g, "\n") // normalize line endings
    .replace(/[ \t]+\n/g, "\n") // remove trailing spaces on lines
    .replace(/\n{2,}/g, "\n\n") // ensure paragraphs have a line break
    .trim();

  console.log("Full Text Content:\n", fullText);
};

// Example usage

const seedUrl =
  "https://www.geeksforgeeks.org/machine-learning/understanding-tf-idf-term-frequency-inverse-document-frequency/";

fetchSeedUrl(seedUrl);
