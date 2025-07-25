import { parentPort } from "worker_threads";
import mongoose from "mongoose";
import { runInvertedIndexQueue } from "../controllers/handlingQueue.controller.js";

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });

    parentPort.on("message", async (inputData) => {
      try {
        await runInvertedIndexQueue(inputData);
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
