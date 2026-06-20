import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middleware";
import router from "./routes";
import morgan from "morgan";
import { env } from "./configs/env";

const app = express();

const corsOpt = {
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
};

app.use(morgan("dev"));
app.use(cors(corsOpt));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.use(errorHandler);

export default app;
