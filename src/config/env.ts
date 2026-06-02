import "dotenv/config";

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
};

if (!config.BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is not defined in .env file");
  process.exit(1);
}

if (!config.MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file");
  process.exit(1);
}