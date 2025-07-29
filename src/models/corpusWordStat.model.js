import mongoose from "mongoose";
import { tokenType } from "../common/constant.js";

const corpusWordStatSchema = new mongoose.Schema(
  {
    word: {
      type: String,
    },
    wordType: {
      type: String,
      enum: tokenType,
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

corpusWordStatSchema.index({ word: 1, wordType: 1 }, { unique: true });
const CorpusWordStat = mongoose.model("CorpusWordStat", corpusWordStatSchema);

export default CorpusWordStat;
