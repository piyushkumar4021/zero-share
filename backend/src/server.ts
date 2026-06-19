import app from "./app";
import { createServer } from "http";
import { env } from "./configs/env";
import { initSocket } from "./socket/socket";
import { createRedisClient } from "./redis/redisClient";

const PORT = env.PORT || 3000;

// Setup
const httpServer = createServer(app);

async function start() {
  try {
    await createRedisClient();
    initSocket(httpServer);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

start();
