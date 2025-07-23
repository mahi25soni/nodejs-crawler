import mongoose from "mongoose";

const crawledSiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    siteName: {
      type: String,
    },
    pageTitle: {
      type: [String],
    },
    metaDescription: {
      type: [String],
    },
    metaKeywords: {
      type: [String],
    },
    outboundLinks: {
      type: [String],
    },
    htmlHeaders: {
      h1: [
        {
          type: String,
        },
      ],
      h2: [
        {
          type: String,
        },
      ],
      h3: [
        {
          type: String,
        },
      ],
    },
    textContent: {
      type: String,
    },
    textTokens: {
      type: [String],
    },
    isCrawled: {
      type: Boolean,
      default: false,
    },
    lastCrawled: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CrawledSite = mongoose.model("CrawledSite", crawledSiteSchema);

export default CrawledSite;
