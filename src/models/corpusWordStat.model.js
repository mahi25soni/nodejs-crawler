import mongoose from "mongoose";

const corpusWordStatSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      unique: true,
      index: true,
    },
    documentFrequency: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const CorpusWordStat = mongoose.model("CorpusWordStat", corpusWordStatSchema);

export default CorpusWordStat;
