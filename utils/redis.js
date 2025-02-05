const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis"); // Updated import

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Initialize Redis clients
const redisPublisher = createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });
const redisSubscriber = createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });
const redisSessionClient = createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });

(async () => {
  try {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    await redisSessionClient.connect();
    console.log("✅ Connected to Redis successfully!");
  } catch (err) {
    console.error("❌ Redis Connection Error:", err);
  }
})();

// Handle Redis errors
redisSubscriber.on("error", (err) => console.error("❌ Redis Subscriber Error:", err));
redisPublisher.on("error", (err) => console.error("❌ Redis Publisher Error:", err));
redisSessionClient.on("error", (err) => console.error("❌ Redis Session Client Error:", err));

// Create Redis session store
const redisStore = new RedisStore({
  client: redisSessionClient, // Use redisSessionClient here
  prefix: "session:", // Optional: Prefix for session keys
});

module.exports = { redisPublisher, redisSubscriber, redisStore };