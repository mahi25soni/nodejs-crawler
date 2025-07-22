import mongoose from "mongoose";
const invertedIndexSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      unique: true,
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

const InvertedIndex = mongoose.model("InvertedIndex", invertedIndexSchema);

export default InvertedIndex;
