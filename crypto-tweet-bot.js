import axios from 'axios';
import { Twit } from 'twit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Twitter client
const twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

// CoinGecko API endpoint for top cryptocurrencies
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Fetches cryptocurrency price data from CoinGecko API
 * @returns {Promise<Object>} Object containing crypto prices and data
 */
async function fetchCryptoData() {
  try {
    const response = await axios.get(COINGECKO_API, {
      params: {
        ids: 'bitcoin,ethereum,cardano',
        vs_currencies: 'usd',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error.message);
    throw error;
  }
}

/**
 * Formats crypto data into a tweet-friendly message
 * @param {Object} cryptoData - Cryptocurrency data from API
 * @returns {string} Formatted tweet message
 */
function formatCryptoTweet(cryptoData) {
  const bitcoin = cryptoData.bitcoin;
  const ethereum = cryptoData.ethereum;
  const cardano = cryptoData.cardano;

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

  const tweet = `📊 Crypto Market Update [${timestamp}]

🔷 Bitcoin: $${bitcoin.usd.toLocaleString()} (${bitcoin.usd_24h_change.toFixed(2)}%)
💜 Ethereum: $${ethereum.usd.toLocaleString()} (${ethereum.usd_24h_change.toFixed(2)}%)
🟣 Cardano: $${cardano.usd.toLocaleString()} (${cardano.usd_24h_change.toFixed(2)}%)

#Crypto #Bitcoin #Ethereum #Blockchain`;

  return tweet;
}

/**
 * Posts a tweet to Twitter
 * @param {string} message - The tweet message to post
 * @returns {Promise<Object>} Twitter API response
 */
async function postTweet(message) {
  try {
    // Check tweet length (Twitter limit is 280 characters)
    if (message.length > 280) {
      console.warn(`Tweet is too long (${message.length} characters). Truncating...`);
      message = message.substring(0, 277) + '...';
    }

    const response = await twitter.post('statuses/update', { status: message });
    console.log('✅ Tweet posted successfully!');
    console.log(`Tweet ID: ${response.data.id_str}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error posting tweet:', error.message);
    throw error;
  }
}

/**
 * Main bot function - fetches crypto data and posts tweet
 */
async function runBot() {
  try {
    console.log('🤖 Starting Crypto Tweet Bot...');
    console.log('📡 Fetching cryptocurrency data...');

    // Fetch crypto data
    const cryptoData = await fetchCryptoData();
    console.log('✅ Crypto data fetched successfully');

    // Format tweet message
    const tweetMessage = formatCryptoTweet(cryptoData);
    console.log('\n📝 Tweet Preview:');
    console.log(tweetMessage);
    console.log(`\n✉️  Tweet length: ${tweetMessage.length} characters`);

    // Post tweet to Twitter
    await postTweet(tweetMessage);

    console.log('\n🎉 Bot execution completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error in bot execution:', error);
    process.exit(1);
  }
}

/**
 * Schedule bot to run at regular intervals
 * @param {number} intervalMinutes - Interval in minutes between bot runs
 */
export function scheduleBot(intervalMinutes = 30) {
  console.log(`⏰ Scheduling bot to run every ${intervalMinutes} minutes`);

  // Run immediately on startup
  runBot().catch(console.error);

  // Run at specified intervals
  setInterval(() => {
    runBot().catch(console.error);
  }, intervalMinutes * 60 * 1000);
}

// Run bot immediately if executed as main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runBot().catch(console.error);
}

export { fetchCryptoData, formatCryptoTweet, postTweet, runBot };