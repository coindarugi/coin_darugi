#!/usr/bin/env node

/**
 * Crypto Darugi - Multilingual Twitter Promotion Bot
 * Posts promotional tweets about crypto-darugi.com in multiple languages
 * Supported languages: Korean, English, French, German, Spanish
 */

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Initialize Twitter API Client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const twitterClient = client.readWrite;

// Promotional messages in multiple languages
const promotionalMessages = {
  korean: [
    '🚀 크립토 다루기로 암호화폐 투자를 시작하세요! 📈\n안전하고 쉬운 거래 플랫폼\n🔗 crypto-darugi.com\n#암호화폐 #블록체인 #비트코인',
    '💰 크립토 다루기 - 당신의 디지털 자산 관리 파트너\n실시간 시세 정보 및 안전한 거래\n✨ crypto-darugi.com에서 시작하세요!\n#다루기 #암호화폐거래',
    '🌟 크립토 다루기와 함께 스마트한 투자를 하세요\n수수료 최소, 보안 최고\n📱 언제 어디서나 거래 가능\ncrypto-darugi.com #암호화폐',
  ],
  english: [
    '🚀 Start your crypto journey with Crypto Darugi! 📈\nSecure, Easy, and Reliable Trading Platform\n🔗 crypto-darugi.com\n#Cryptocurrency #Blockchain #Bitcoin #CryptoTrading',
    '💰 Crypto Darugi - Your Digital Asset Management Partner\nReal-time Market Data & Secure Transactions\n✨ Begin at crypto-darugi.com!\n#Crypto #Trading #Web3',
    '🌟 Trade Smart with Crypto Darugi\nLowest Fees, Highest Security\n📱 Trade Anytime, Anywhere\ncrypto-darugi.com #CryptoLife',
  ],
  french: [
    '🚀 Commencez votre voyage crypto avec Crypto Darugi! 📈\nPlateforme de Trading Sécurisée et Facile\n🔗 crypto-darugi.com\n#Cryptomonnaie #Blockchain #Bitcoin #Trading',
    '💰 Crypto Darugi - Votre Partenaire de Gestion d\'Actifs Numériques\nDonnées de Marché en Temps Réel & Transactions Sécurisées\n✨ Commencez à crypto-darugi.com!\n#Crypto #Investissement',
    '🌟 Tradez Intelligemment avec Crypto Darugi\nFrais les Plus Bas, Sécurité la Plus Élevée\n📱 Tradez N\'importe Quand, N\'importe Où\ncrypto-darugi.com #DeFi',
  ],
  german: [
    '🚀 Starten Sie Ihre Krypto-Reise mit Crypto Darugi! 📈\nSichere, Einfache und Zuverlässige Handelsplattform\n🔗 crypto-darugi.com\n#Kryptowährung #Blockchain #Bitcoin #Handel',
    '💰 Crypto Darugi - Ihr Partner für Digitale Vermögensverwaltung\nEchtzeit-Marktdaten & Sichere Transaktionen\n✨ Beginnen Sie bei crypto-darugi.com!\n#Crypto #Trading #Web3',
    '🌟 Handeln Sie Intelligent mit Crypto Darugi\nNiedrigste Gebühren, Höchste Sicherheit\n📱 Handeln Sie Jederzeit, Überall\ncrypto-darugi.com #Krypto',
  ],
  spanish: [
    '🚀 ¡Comienza tu viaje cripto con Crypto Darugi! 📈\nPlataforma de Trading Segura y Fácil\n🔗 crypto-darugi.com\n#Criptomoneda #Blockchain #Bitcoin #Trading',
    '💰 Crypto Darugi - Tu Socio en Gestión de Activos Digitales\nDatos del Mercado en Tiempo Real y Transacciones Seguras\n✨ ¡Comienza en crypto-darugi.com!\n#Cripto #Inversión',
    '🌟 Negocia de Forma Inteligente con Crypto Darugi\nAranceles Más Bajos, Seguridad Máxima\n📱 Negocia en Cualquier Momento, en Cualquier Lugar\ncrypto-darugi.com #CryptoLife',
  ],
};

// Language distribution for scheduled posts
const languages = Object.keys(promotionalMessages);

/**
 * Post a tweet in a specified language
 * @param {string} language - Language code (korean, english, french, german, spanish)
 * @returns {Promise<object>} - Tweet response object
 */
async function postTweet(language) {
  try {
    if (!languages.includes(language)) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${languages.join(', ')}`);
    }

    const messages = promotionalMessages[language];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    console.log(`\n📢 Posting ${language.toUpperCase()} tweet...`);
    console.log(`Message:\n${randomMessage}\n`);

    const response = await twitterClient.v2.tweet(randomMessage);

    console.log(`✅ Tweet posted successfully!`);
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`Created at: ${new Date().toISOString()}\n`);

    return response;
  } catch (error) {
    console.error(`❌ Error posting ${language} tweet:`, error.message);
    throw error;
  }
}

/**
 * Post tweets in all languages
 * @returns {Promise<void>}
 */
async function postAllLanguageTweets() {
  try {
    console.log('🌍 Starting multilingual promotional campaign...\n');
    const results = [];

    for (const language of languages) {
      try {
        const result = await postTweet(language);
        results.push({ language, success: true, tweetId: result.data.id });

        // Add delay between posts to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({ language, success: false, error: error.message });
      }
    }

    console.log('📊 Campaign Summary:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.language.toUpperCase()}: ${result.success ? 'Posted' : 'Failed'}`);
    });
  } catch (error) {
    console.error('❌ Campaign failed:', error.message);
    process.exit(1);
  }
}

/**
 * Schedule automatic posts at regular intervals
 * @param {number} intervalHours - Interval in hours between posts
 */
function scheduleAutomaticPosts(intervalHours = 6) {
  console.log(`⏰ Scheduling automatic posts every ${intervalHours} hours...\n`);

  // Post immediately on start
  postAllLanguageTweets().catch((error) => {
    console.error('Initial post failed:', error.message);
  });

  // Schedule recurring posts
  setInterval(() => {
    postAllLanguageTweets().catch((error) => {
      console.error('Scheduled post failed:', error.message);
    });
  }, intervalHours * 60 * 60 * 1000);
}

// CLI argument handling
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node crypto-bot.js [command] [options]');
  console.log('\nCommands:');
  console.log('  post-all              Post tweets in all languages');
  console.log('  post <language>       Post tweet in specific language');
  console.log('                        (korean, english, french, german, spanish)');
  console.log('  schedule [hours]      Schedule automatic posts (default: 6 hours)');
  console.log('\nExamples:');
  console.log('  node crypto-bot.js post-all');
  console.log('  node crypto-bot.js post korean');
  console.log('  node crypto-bot.js schedule 4\n');
  process.exit(0);
}

const command = args[0];

(async () => {
  try {
    // Validate API credentials
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET ||
        !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_SECRET) {
      throw new Error('Missing required Twitter API credentials in environment variables');
    }

    switch (command) {
      case 'post-all':
        await postAllLanguageTweets();
        process.exit(0);
        break;

      case 'post':
        if (!args[1]) {
          throw new Error('Language argument required. Available: korean, english, french, german, spanish');
        }
        await postTweet(args[1]);
        process.exit(0);
        break;

      case 'schedule':
        const hours = parseInt(args[1]) || 6;
        if (isNaN(hours) || hours < 1) {
          throw new Error('Invalid interval. Must be a positive number of hours');
        }
        scheduleAutomaticPosts(hours);
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

module.exports = {
  postTweet,
  postAllLanguageTweets,
  scheduleAutomaticPosts,
  promotionalMessages,
};
