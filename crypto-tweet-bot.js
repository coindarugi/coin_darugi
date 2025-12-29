#!/usr/bin/env node

/**
 * Crypto Darugi - Multilingual Twitter Promotion Bot
 * Posts promotional tweets about crypto-darugi.com in multiple languages
 * Supported languages: Korean, English, French, German, Spanish (5 languages)
 * Runs every 8 hours via GitHub Actions
 */

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Promotional messages in 5 languages with localized URLs
// Each language has at least 5 variations
const promotionalMessages = {
  korean: [
    '🚀 크립토 다루기에서 암호화폐 투자를 시작하세요! 📈\n실시간 시세와 안전한 거래 플랫폼\n🔗 https://crypto-darugi.com/ko\n#암호화폐 #블록체인 #비트코인 #투자',
    '💰 크립토 다루기 - 당신의 디지털 자산 관리 파트너 ✨\n쉽고 빠른 거래, 최고의 보안\n📱 지금 시작하세요: https://crypto-darugi.com/ko\n#암호화폐거래 #다루기 #디지털자산',
    '🌟 스마트한 암호화폐 투자, 크립토 다루기와 함께!\n수수료 최소화, 보안 최우선\n✅ https://crypto-darugi.com/ko에서 만나보세요\n#코인투자 #가상화폐 #크립토',
    '📊 실시간 암호화폐 시세 정보와 안전한 거래!\n크립토 다루기로 스마트하게 투자하세요 💎\n🔗 https://crypto-darugi.com/ko\n#비트코인 #이더리움 #암호화폐투자',
    '🎯 암호화폐 투자의 새로운 기준, 크립토 다루기\n언제 어디서나 간편한 거래 🌐\n시작하기: https://crypto-darugi.com/ko\n#블록체인 #디지털화폐 #투자플랫폼',
  ],
  english: [
    '🚀 Start your crypto journey with Crypto Darugi! 📈\nReal-time market data & secure trading platform\n🔗 https://crypto-darugi.com/en\n#Cryptocurrency #Blockchain #Bitcoin #CryptoTrading',
    '💰 Crypto Darugi - Your Digital Asset Management Partner ✨\nEasy, Fast, and Secure Trading\n📱 Get started: https://crypto-darugi.com/en\n#Crypto #Trading #DigitalAssets #Web3',
    '🌟 Smart Crypto Investing with Crypto Darugi!\nLowest Fees, Maximum Security\n✅ Visit us: https://crypto-darugi.com/en\n#CryptoInvestment #BTC #ETH #DeFi',
    '📊 Real-time cryptocurrency market data & secure trading!\nInvest smartly with Crypto Darugi 💎\n🔗 https://crypto-darugi.com/en\n#Bitcoin #Ethereum #CryptoLife #Investing',
    '🎯 The new standard in crypto trading - Crypto Darugi\nTrade anytime, anywhere 🌐\nStart now: https://crypto-darugi.com/en\n#Blockchain #DigitalCurrency #CryptoPlatform',
  ],
  french: [
    '🚀 Commencez votre aventure crypto avec Crypto Darugi! 📈\nDonnées de marché en temps réel et plateforme sécurisée\n🔗 https://crypto-darugi.com/fr\n#Cryptomonnaie #Blockchain #Bitcoin #Trading',
    '💰 Crypto Darugi - Votre partenaire de gestion d\'actifs numériques ✨\nTrading facile, rapide et sécurisé\n📱 Commencez: https://crypto-darugi.com/fr\n#Crypto #Trading #ActifsNumériques #Web3',
    '🌟 Investissement crypto intelligent avec Crypto Darugi!\nFrais minimums, sécurité maximale\n✅ Visitez-nous: https://crypto-darugi.com/fr\n#InvestissementCrypto #BTC #ETH #DeFi',
    '📊 Données de marché crypto en temps réel et trading sécurisé!\nInvestissez intelligemment avec Crypto Darugi 💎\n🔗 https://crypto-darugi.com/fr\n#Bitcoin #Ethereum #VieCrypto #Investissement',
    '🎯 La nouvelle norme du trading crypto - Crypto Darugi\nTradez n\'importe quand, n\'importe où 🌐\nCommencez: https://crypto-darugi.com/fr\n#Blockchain #MonnaieNumérique #PlateformeCrypto',
  ],
  german: [
    '🚀 Starten Sie Ihre Krypto-Reise mit Crypto Darugi! 📈\nEchtzeit-Marktdaten und sichere Handelsplattform\n🔗 https://crypto-darugi.com/de\n#Kryptowährung #Blockchain #Bitcoin #Handel',
    '💰 Crypto Darugi - Ihr Partner für digitale Vermögensverwaltung ✨\nEinfacher, schneller und sicherer Handel\n📱 Jetzt starten: https://crypto-darugi.com/de\n#Krypto #Trading #DigitaleAssets #Web3',
    '🌟 Intelligentes Krypto-Investment mit Crypto Darugi!\nNiedrigste Gebühren, maximale Sicherheit\n✅ Besuchen Sie uns: https://crypto-darugi.com/de\n#KryptoInvestment #BTC #ETH #DeFi',
    '📊 Echtzeit-Kryptowährungsmarktdaten und sicherer Handel!\nInvestieren Sie intelligent mit Crypto Darugi 💎\n🔗 https://crypto-darugi.com/de\n#Bitcoin #Ethereum #KryptoLeben #Investieren',
    '🎯 Der neue Standard im Krypto-Handel - Crypto Darugi\nHandeln Sie jederzeit, überall 🌐\nJetzt beginnen: https://crypto-darugi.com/de\n#Blockchain #DigitaleWährung #KryptoPlattform',
  ],
  spanish: [
    '🚀 ¡Comienza tu viaje cripto con Crypto Darugi! 📈\nDatos de mercado en tiempo real y plataforma segura\n🔗 https://crypto-darugi.com/es\n#Criptomoneda #Blockchain #Bitcoin #Trading',
    '💰 Crypto Darugi - Tu socio en gestión de activos digitales ✨\nTrading fácil, rápido y seguro\n📱 Empieza ahora: https://crypto-darugi.com/es\n#Cripto #Trading #ActivosDigitales #Web3',
    '🌟 ¡Inversión cripto inteligente con Crypto Darugi!\nTarifas mínimas, seguridad máxima\n✅ Visítanos: https://crypto-darugi.com/es\n#InversiónCripto #BTC #ETH #DeFi',
    '📊 ¡Datos de mercado cripto en tiempo real y trading seguro!\nInvierte inteligentemente con Crypto Darugi 💎\n🔗 https://crypto-darugi.com/es\n#Bitcoin #Ethereum #VidaCripto #Inversión',
    '🎯 El nuevo estándar en trading cripto - Crypto Darugi\nTrading en cualquier momento, en cualquier lugar 🌐\nEmpieza ahora: https://crypto-darugi.com/es\n#Blockchain #MonedaDigital #PlataformaCripto',
  ],
};

// Language codes for iteration
const languages = Object.keys(promotionalMessages);

/**
 * Initialize Twitter API client
 * @returns {object} Twitter client instance
 */
function initTwitterClient() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  return client.readWrite;
}

/**
 * Validate Twitter API credentials
 * @throws {Error} If any required credential is missing
 */
function validateCredentials() {
  const requiredVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Twitter API credentials validated');
}

/**
 * Select a random tweet message for a given language
 * @param {string} language - Language code
 * @returns {string} Random tweet message
 */
function selectRandomTweet(language) {
  const messages = promotionalMessages[language];
  if (!messages || messages.length === 0) {
    throw new Error(`No messages available for language: ${language}`);
  }
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Post a tweet in a randomly selected language
 * @returns {Promise<object>} Tweet response object
 */
async function postRandomLanguageTweet() {
  try {
    // Initialize Twitter client
    const twitterClient = initTwitterClient();
    
    // Select random language
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    
    // Select random tweet for that language
    const tweetContent = selectRandomTweet(randomLanguage);

    console.log(`\n📢 Posting tweet in ${randomLanguage.toUpperCase()}...`);
    console.log(`Content:\n${tweetContent}\n`);

    // Post the tweet
    const response = await twitterClient.v2.tweet(tweetContent);

    console.log(`✅ Tweet posted successfully!`);
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`Language: ${randomLanguage}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    return {
      success: true,
      tweetId: response.data.id,
      language: randomLanguage,
      content: tweetContent,
    };
  } catch (error) {
    console.error(`❌ Error posting tweet:`, error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🤖 Crypto Darugi - Multilingual Twitter Bot');
    console.log('==========================================\n');

    // Validate credentials
    validateCredentials();

    // Post a random language tweet
    const result = await postRandomLanguageTweet();

    console.log('✨ Bot execution completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the bot
if (require.main === module) {
  main();
}

// Export functions for testing
module.exports = {
  postRandomLanguageTweet,
  selectRandomTweet,
  validateCredentials,
  promotionalMessages,
  languages,
};
