import axios from "axios";
import { parse } from "node-html-parser";

const getHref = (attibuteString) => {
  //   const last = attibuteString.lastIndexOf("href");

  //   const startUrl = attibuteString.indexOf('"', last);
  //   const endUrl = attibuteString.indexOf('"', startUrl + 1);

  //   const url = attibuteString.substring(startUrl + 1, endUrl);

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

  const anchorTags = parsedData.querySelectorAll("a");

  const firstOne = anchorTags[1];
  //   getHref(firstOne.rawAttrs);

  anchorTags.map((ele) => {
    getHref(ele.rawAttrs);
  });
};

const seedUrl = "https://www.linkedin.com/jobs/";

fetchSeedUrl(seedUrl);
