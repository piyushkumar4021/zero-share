import Redis from "ioredis";

let redis: Redis;
export const createRedisClient = async () => {
  redis = new Redis({
    username: "default",
    password: "PzBeliAWkVESqiXs6sTuGhNzcSEjwnqZ",
    host: "redis-15435.crce276.ap-south-1-3.ec2.cloud.redislabs.com",
    port: 15435,
  });

  await new Promise((res, rej) => {
    redis.once("ready", res);
    redis.once("error", rej);
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });
};

export const getRedisClient = () => redis;
