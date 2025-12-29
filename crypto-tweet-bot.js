import Anthropic from "@anthropic-ai/sdk";
import { TwitterApi } from "twitter-api-v2";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize clients
const client = new Anthropic();
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

// Function to generate crypto market insight
async function generateCryptoInsight() {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content:
          'Generate a creative and insightful tweet about cryptocurrency market trends, blockchain technology, or Web3. Keep it under 280 characters, informative, and engaging. No hashtags needed.',
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  throw new Error("Unexpected response type from Claude");
}

// Function to post tweet
async function postTweet(text) {
  try {
    const response = await rwClient.v2.tweet(text);
    console.log("Tweet posted successfully!");
    console.log("Tweet ID:", response.data.id);
    console.log("Tweet text:", text);
    return response.data;
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log("Starting crypto tweet bot...");
    console.log("Generating crypto market insight...");

    const insight = await generateCryptoInsight();
    console.log("Generated insight:", insight);

    console.log("Posting tweet...");
    await postTweet(insight);

    console.log("Bot execution completed successfully!");
  } catch (error) {
    console.error("Fatal error in bot execution:", error);
    process.exit(1);
  }
}

// Run the bot with async IIFE to handle top-level await properly
(async () => {
  await main();
})();
