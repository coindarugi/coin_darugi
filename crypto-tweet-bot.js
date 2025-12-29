/**
 * Cryptocurrency Tweet Bot
 * Generates and posts tweets about cryptocurrency with language-specific URLs
 */

import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';

// Twitter API configuration
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

const rwClient = client.readWrite;

/**
 * Build language-specific URL
 * Korean uses base URL, other languages use ?lang= parameter
 * @param {string} baseUrl - The base URL
 * @param {string} language - The language code (e.g., 'ko', 'en', 'zh')
 * @returns {string} The language-specific URL
 */
function buildLanguageUrl(baseUrl, language = 'ko') {
  if (language === 'ko' || language === 'korean') {
    return baseUrl;
  }
  return `${baseUrl}?lang=${language}`;
}

/**
 * Fetch cryptocurrency data
 * @returns {Promise<Object>} Cryptocurrency data
 */
async function fetchCryptoData() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum',
        vs_currencies: 'usd,krw',
        include_market_cap: true,
        include_24hr_vol: true,
        include_change: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

/**
 * Generate tweet content based on crypto data
 * @param {Object} cryptoData - Cryptocurrency data
 * @param {string} language - Language for the tweet
 * @returns {string} Tweet content
 */
function generateTweet(cryptoData, language = 'ko') {
  const btc = cryptoData.bitcoin;
  const eth = cryptoData.ethereum;

  const baseUrl = 'https://coindarugi.com';
  const url = buildLanguageUrl(baseUrl, language);

  let tweet = '';

  if (language === 'ko' || language === 'korean') {
    tweet = `🌟 암호화폐 시장 업데이트\n\n` +
      `비트코인: $${btc.usd.toLocaleString()} (${btc.usd_24h_change > 0 ? '📈' : '📉'} ${btc.usd_24h_change.toFixed(2)}%)\n` +
      `이더리움: $${eth.usd.toLocaleString()} (${eth.usd_24h_change > 0 ? '📈' : '📉'} ${eth.usd_24h_change.toFixed(2)}%)\n\n` +
      `더 자세한 정보: ${url}`;
  } else if (language === 'en' || language === 'english') {
    tweet = `🌟 Cryptocurrency Market Update\n\n` +
      `Bitcoin: $${btc.usd.toLocaleString()} (${btc.usd_24h_change > 0 ? '📈' : '📉'} ${btc.usd_24h_change.toFixed(2)}%)\n` +
      `Ethereum: $${eth.usd.toLocaleString()} (${eth.usd_24h_change > 0 ? '📈' : '📉'} ${eth.usd_24h_change.toFixed(2)}%)\n\n` +
      `Learn more: ${url}`;
  } else if (language === 'zh' || language === 'chinese') {
    tweet = `🌟 加密货币市场更新\n\n` +
      `比特币: $${btc.usd.toLocaleString()} (${btc.usd_24h_change > 0 ? '📈' : '📉'} ${btc.usd_24h_change.toFixed(2)}%)\n` +
      `以太坊: $${eth.usd.toLocaleString()} (${eth.usd_24h_change > 0 ? '📈' : '📉'} ${eth.usd_24h_change.toFixed(2)}%)\n\n` +
      `了解更多: ${url}`;
  }

  return tweet;
}

/**
 * Post tweet to Twitter
 * @param {string} content - Tweet content
 * @returns {Promise<Object>} Twitter API response
 */
async function postTweet(content) {
  try {
    const response = await rwClient.v2.tweet(content);
    console.log('Tweet posted successfully:', response);
    return response;
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
}

/**
 * Main function to generate and post cryptocurrency tweets
 * @param {string} language - Language for the tweet (default: 'ko')
 */
async function main(language = 'ko') {
  try {
    console.log(`Generating crypto tweet in ${language}...`);
    
    const cryptoData = await fetchCryptoData();
    const tweet = generateTweet(cryptoData, language);
    
    console.log('Tweet content:');
    console.log(tweet);
    
    await postTweet(tweet);
    console.log('Tweet posted successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the bot only when executed directly (not when imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
  const language = process.env.TWEET_LANGUAGE || 'ko';
  main(language);
}

export { buildLanguageUrl, generateTweet, fetchCryptoData, postTweet };
