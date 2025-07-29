import { Router } from "express";
import { fetchSiteData } from "../controllers/preprocessing.controller.js";
import temtTime from "../libs/temtTime.js";
import { searchSite } from "../controllers/search.controller.js";
const mainRouter = Router();

mainRouter.post("/fetch-site-data", fetchSiteData);
mainRouter.post("/search", searchSite);
mainRouter.get("/total-time", (req, res) => {
  const { apiStartTime, endingCorpusQueueTime, endingIndeQueueTime } = temtTime;

  if (!apiStartTime || (!endingCorpusQueueTime && !endingIndeQueueTime)) {
    return res.status(400).json({ error: "Timing data incomplete" });
  }

  const latestEndTime = Math.max(
    endingCorpusQueueTime || 0,
    endingIndeQueueTime || 0
  );

  const durationMs = latestEndTime - apiStartTime;

  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const formattedTime = `${minutes.toString().padStart(2, "0")}::${seconds
    .toString()
    .padStart(2, "0")}`;

  return res.json(`${minutes} : ${seconds}`);
});

export default mainRouter;
