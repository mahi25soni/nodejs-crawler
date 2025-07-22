import Express from "express";
import dotenv from "dotenv";
import mainRouter from "./src/routers/mainRouter.js";

const app = Express();
dotenv.config();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use("/api", mainRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
