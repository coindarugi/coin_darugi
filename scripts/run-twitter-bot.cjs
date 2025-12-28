#!/usr/bin/env node

const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

// Configuration
const TWITTER_API_URL = 'https://api.twitter.com/2/tweets';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const UPBIT_API_URL = 'https://api.upbit.com/api/v1';
const COINCAP_API_URL = 'https://api.coincap.io/v2';

// OAuth 1.0a credentials
const CONSUMER_KEY = process.env.TWITTER_API_KEY;
const CONSUMER_SECRET = process.env.TWITTER_API_SECRET;
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Multi-language tweet templates
const TWEET_TEMPLATES = {
  korean: [
    '🚀 김치프리미엄 현황 업데이트!\n비트코인: {btc_premium}%\n이더리움: {eth_premium}%\n#암호화폐 #비트코인 #이더리움 {hashtags}',
    '💰 암호화폐 시장 분석\n비트코인: ${btc_price}\n이더리움: ${eth_price}\n거래량: {volume} BTC\n#Crypto #Bitcoin #Ethereum {hashtags}'
  ],
  english: [
    '🚀 Kimchi Premium Update!\nBTC: {btc_premium}%\nETH: {eth_premium}%\n#cryptocurrency #bitcoin #ethereum {hashtags}',
    '💰 Crypto Market Analysis\nBitcoin: ${btc_price}\nEthereum: ${eth_price}\nVolume: {volume} BTC\n#Crypto #Bitcoin #Ethereum {hashtags}'
  ],
  french: [
    '🚀 Mise à jour de la Prime Kimchi!\nBTC: {btc_premium}%\nETH: {eth_premium}%\n#cryptomonnaie #bitcoin #ethereum {hashtags}',
    '💰 Analyse du Marché Crypto\nBitcoin: ${btc_price}\nEthereum: ${eth_price}\nVolume: {volume} BTC\n#Crypto #Bitcoin #Ethereum {hashtags}'
  ],
  german: [
    '🚀 Kimchi-Premium-Update!\nBTC: {btc_premium}%\nETH: {eth_premium}%\n#Kryptowährung #Bitcoin #Ethereum {hashtags}',
    '💰 Kryptomarkt-Analyse\nBitcoin: ${btc_price}\nEthereum: ${eth_price}\nVolume: {volume} BTC\n#Crypto #Bitcoin #Ethereum {hashtags}'
  ],
  spanish: [
    '🚀 ¡Actualización Premium Kimchi!\nBTC: {btc_premium}%\nETH: {eth_premium}%\n#criptomoneda #bitcoin #ethereum {hashtags}',
    '💰 Análisis del Mercado Crypto\nBitcoin: ${btc_price}\nEthereum: ${eth_price}\nVolumen: {volume} BTC\n#Crypto #Bitcoin #Ethereum {hashtags}'
  ]
};

const HASHTAGS = {
  korean: '#암호화폐 #비트코인 #이더리움 #업비트 #코인다루기',
  english: '#Cryptocurrency #Bitcoin #Ethereum #Crypto #Trading',
  french: '#Cryptomonnaie #Bitcoin #Ethereum #Crypto #Trading',
  german: '#Kryptowährung #Bitcoin #Ethereum #Crypto #Trading',
  spanish: '#Criptomoneda #Bitcoin #Ethereum #Crypto #Trading'
};

/**
 * Generate OAuth 1.0a signature
 */
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const baseString = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(
    Object.keys(params)
      .sort()
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&')
  );

  const signingKey = encodeURIComponent(consumerSecret) + '&' + encodeURIComponent(tokenSecret);
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

/**
 * Build OAuth 1.0a authorization header
 */
function buildAuthorizationHeader(method, url, params, consumerSecret, tokenSecret) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth token_method: 'HMAC-SHA1',
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...params };
  const signature = generateOAuthSignature(method, url, allParams, consumerSecret, tokenSecret);
  oauthParams.oauth_signature = signature;

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => encodeURIComponent(key) + '="' + encodeURIComponent(oauthParams[key]) + '"')
    .join(', ');

  return authHeader;
}

/**
 * Fetch data from HTTPS endpoint
 */
function fetchData(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject).end();
  });
}

/**
 * Fetch Kimchi Premium data from Upbit
 */
async function getKimchiPremium() {
  try {
    const upbitData = await fetchData(`${UPBIT_API_URL}/ticker?codes=KRW-BTC,KRW-ETH`);
    const globalData = await fetchData(`${COINCAP_API_URL}/rates?ids=bitcoin,ethereum`);

    if (!upbitData || !globalData) {
      throw new Error('Failed to fetch price data');
    }

    const btcUpbit = upbitData[0]?.trade_price || 0;
    const ethUpbit = upbitData[1]?.trade_price || 0;

    const btcGlobal = parseFloat(globalData.data.bitcoin.rateUsd) * 1200; // KRW conversion
    const ethGlobal = parseFloat(globalData.data.ethereum.rateUsd) * 1200;

    const btcPremium = ((btcUpbit - btcGlobal) / btcGlobal * 100).toFixed(2);
    const ethPremium = ((ethUpbit - ethGlobal) / ethGlobal * 100).toFixed(2);

    return {
      btc_premium: btcPremium,
      eth_premium: ethPremium,
      btc_price: btcGlobal.toFixed(0),
      eth_price: ethGlobal.toFixed(0),
      volume: upbitData[0]?.candle_acc_trade_volume?.toFixed(2) || '0'
    };
  } catch (error) {
    console.error('Error fetching kimchi premium:', error.message);
    return {
      btc_premium: 'N/A',
      eth_premium: 'N/A',
      btc_price: 'N/A',
      eth_price: 'N/A',
      volume: 'N/A'
    };
  }
}

/**
 * Post tweet using OAuth 1.0a
 */
async function postTweet(text) {
  try {
    const params = { text };
    const method = 'POST';
    const url = TWITTER_API_URL;

    const authHeader = buildAuthorizationHeader(method, url, params, CONSUMER_SECRET, ACCESS_TOKEN_SECRET);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.twitter.com',
        path: '/2/tweets',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }).on('error', reject);

      req.write(JSON.stringify(params));
      req.end();
    });
  } catch (error) {
    console.error('Error posting tweet:', error.message);
    throw error;
  }
}

/**
 * Select random language and template
 */
function selectRandomTemplate() {
  const languages = Object.keys(TWEET_TEMPLATES);
  const language = languages[Math.floor(Math.random() * languages.length)];
  const templates = TWEET_TEMPLATES[language];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const hashtags = HASHTAGS[language];
  
  return { language, template, hashtags };
}

/**
 * Format and post tweet
 */
async function run() {
  try {
    console.log('🤖 Starting Twitter Bot...');
    console.log('⏰ Time:', new Date().toISOString());

    // Validate environment variables
    if (!CONSUMER_KEY || !CONSUMER_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
      throw new Error('Missing Twitter OAuth credentials in environment variables');
    }

    // Fetch market data
    console.log('📊 Fetching market data...');
    const marketData = await getKimchiPremium();
    console.log('💹 Market Data:', marketData);

    // Select template and language
    const { language, template, hashtags } = selectRandomTemplate();
    console.log(`🌍 Selected language: ${language}`);

    // Format tweet
    let tweet = template
      .replace('{btc_premium}', marketData.btc_premium)
      .replace('{eth_premium}', marketData.eth_premium)
      .replace('${btc_price}', marketData.btc_price)
      .replace('${eth_price}', marketData.eth_price)
      .replace('{volume}', marketData.volume)
      .replace('{hashtags}', hashtags);

    console.log('\n📝 Tweet Content:');
    console.log(tweet);
    console.log(`\n📤 Posting to Twitter (@${CONSUMER_KEY})...`);

    // Post tweet
    const result = await postTweet(tweet);
    console.log('✅ Tweet posted successfully!');
    console.log('🔗 Tweet ID:', result.data?.id);
    console.log('⏰ Posted at:', new Date().toISOString());

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the bot
run();
