import { parentPort } from "worker_threads";
import mongoose from "mongoose";
import { runCorpusWordQueue } from "../controllers/handlingQueue.controller.js";

(async () => {
  try {
    // ✅ Establish DB connection for the worker thread
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });

    // Listen for messages
    parentPort.on("message", async (inputData) => {
      try {
        await runCorpusWordQueue(inputData);
        parentPort?.postMessage("ready-for-next");
      } catch (err) {
        console.error("Corpus worker error:", err);
        parentPort?.postMessage("failed");
      }
    });
  } catch (err) {
    console.error("❌ Corpus worker init error:", err);
    parentPort?.postMessage("❌ Worker init failed");
  }
})();
