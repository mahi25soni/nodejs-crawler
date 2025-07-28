import mongoose from "mongoose";
import { tokenType } from "../common/constant.js";
const invertedIndexSchema = new mongoose.Schema(
  {
    word: {
      type: String,
    },
    wordType: {
      type: String,
      enum: tokenType,
    },
    documents: [
      {
        siteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CrawledSite",
        },
        termFrequency: {
          type: Number,
        },
        totalWordsInDoc: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

invertedIndexSchema.index({ word: 1, wordType: 1 }, { unique: true });

const InvertedIndex = mongoose.model("InvertedIndex", invertedIndexSchema);

export default InvertedIndex;
