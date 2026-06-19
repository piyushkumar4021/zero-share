import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middleware";
import router from "./routes";
import { NotFoundError } from "./errors/notFoundError";
import morgan from "morgan";
import { getRedisClient } from "./redis/redisClient";

const app = express();

const corsOpt = {
  origin: "http://localhost:8080",
  credentials: true,
};

app.use(morgan("dev"));
app.use(cors(corsOpt));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use("/check/:id", async (req, res) => {
  const { id } = req.params;
  const redisClient = getRedisClient();
  const key = `device_${id}`;

  let data = await redisClient.get(key).catch(() => null);
  data = data && JSON.parse(data);

  console.log(data);
  res.send({ data });
});

app.use((req, res) => {
  throw new NotFoundError("Route not found");
});

app.use(errorHandler);

export default app;
