import { Router } from "express";
import { fetchSiteData } from "../controllers/preprocessing.controller.js";
const mainRouter = Router();

mainRouter.post("/fetch-site-data", fetchSiteData);

export default mainRouter;
