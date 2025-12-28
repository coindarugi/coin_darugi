// scripts/run-twitter-bot.cjs (CommonJS)

const SITE_URL = 'https://crypto-darugi.com/';

const LANGUAGES = {
  ko: { 
    name: '한국어', 
    hashtags: '#비트코인 #김치프리미엄 #코인전망 #가상화폐 #투자',
    promotion: '⚡ 10,000+ 코인 실시간 시세와 AI 전망을 한눈에!\n💎 암호화폐 투자의 필수품, 크립토 대시보드'
  },
  en: { 
    name: 'English', 
    hashtags: '#Bitcoin #Crypto #Trading #AI #Investment',
    promotion: '🚀 Track 10,000+ coins real-time & Check AI Forecasts!\n💎 Your all-in-one Cryptocurrency Dashboard.\n\n✅ AI-powered Market Analysis\n✅ Real-time Portfolio Tracker\n✅ Global Exchange Prices'
  },
  fr: { 
    name: 'Français', 
    hashtags: '#Bitcoin #Crypto #Trading #Finance #IA',
    promotion: '🚀 Suivez 10 000+ cryptos en temps réel & Prévisions IA !\n💎 Votre tableau de bord crypto tout-en-un.\n\n✅ Analyse de marché par IA\n✅ Suivi de portefeuille en temps réel'
  },
  de: { 
    name: 'Deutsch', 
    hashtags: '#Bitcoin #Krypto #Trading #Investieren #KI',
    promotion: '🚀 Echtzeit-Kurse für 10.000+ Coins & KI-Prognosen!\n💎 Ihr All-in-One Krypto-Dashboard.\n\n✅ KI-gestützte Marktanalyse\n✅ Echtzeit-Portfolio-Tracker'
  },
  es: { 
    name: 'Español', 
    hashtags: '#Bitcoin #Cripto #Trading #Inversión #IA',
    promotion: '🚀 ¡Sigue más de 10,000 monedas y pronósticos de IA!\n💎 Tu panel de control de criptomonedas todo en uno.\n\n✅ Análisis de mercado impulsado por IA\n✅ Rastreador de cartera en tiempo real'
  },
};

const crypto = require('crypto');

// OAuth 1.0a 서명 생성 함수
function getOAuthHeader(method, url, consumerKey, consumerSecret, token, tokenSecret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const percentEncode = (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  };

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: token,
    oauth_version: '1.0'
  };

  const sortedParams = Object.keys(oauthParams).sort().map(k => {
    return `${percentEncode(k)}=${percentEncode(oauthParams[k])}`;
  }).join('&');

  const signatureBaseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  const headerParams = { ...oauthParams, oauth_signature: signature };
  const headerString = Object.keys(headerParams).sort().map(k => {
    return `${percentEncode(k)}="${percentEncode(headerParams[k])}"`;
  }).join(', ');

  return `OAuth ${headerString}`;
}

// Native fetch 사용 (Node 18+)
async function postTweet(text, language, keys) {
  const url = 'https://api.twitter.com/2/tweets';
  const method = 'POST';
  
  try {
    const authHeader = getOAuthHeader(
      method, 
      url, 
      keys.appKey, 
      keys.appSecret, 
      keys.accessToken, 
      keys.accessSecret
    );

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'CryptoDashboardBot/1.0'
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twitter API Error: ${response.status} ${JSON.stringify(data)}`);
    }

    console.log(`✅ [${language}] 트윗 성공! ID: ${data.data.id}`);
    return { success: true, id: data.data.id };
  } catch (error) {
    console.error(`❌ [${language}] 트윗 실패:`, error);
    return { success: false, error: error.message };
  }
}

async function getKimchiPremiumData() {
  try {
    const globalRes = await fetch('https://api.coincap.io/v2/assets/bitcoin');
    const globalJson = await globalRes.json();
    const usdPrice = parseFloat(globalJson.data.priceUsd);

    const upbitRes = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const upbitJson = await upbitRes.json();
    const krwPrice = upbitJson[0].trade_price;

    const exchangeRate = 1460; 
    const globalKrwPrice = usdPrice * exchangeRate;

    return ((krwPrice - globalKrwPrice) / globalKrwPrice) * 100;
  } catch (error) {
    console.error('김프 조회 실패:', error.message);
    return null;
  }
}

function createTweetText(kimchiPremium, language) {
  const langConfig = LANGUAGES[language];
  let content = '';

  if (language === 'ko') {
    content += `🔥 비트코인 김치 프리미엄 알림\n\n`;
    if (kimchiPremium !== null) {
      const emoji = kimchiPremium >= 0 ? '🔴' : '🔵';
      content += `🌶️ 현재 김프: ${emoji} ${kimchiPremium > 0 ? '+' : ''}${kimchiPremium.toFixed(2)}%\n\n`;
    }
  }

  content += `${langConfig.promotion}\n\n`;
  const targetUrl = language === 'ko' ? SITE_URL : `${SITE_URL}?lang=${language}`;
  content += `👉 ${targetUrl}\n\n`;
  content += langConfig.hashtags;

  return content;
}

async function run() {
  console.log('🚀 GitHub Actions 트위터 봇 시작 (CJS Mode)...');

  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;

  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    console.error('❌ 트위터 API 키가 설정되지 않았습니다.');
    process.exit(1);
  }

  const keys = {
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET
  };

  try {
    const kimchiPremium = await getKimchiPremiumData();

    for (const lang of Object.keys(LANGUAGES)) {
      const text = createTweetText(kimchiPremium, lang);
      console.log(`\n🐦 [${lang}] 트윗 발행 중...`);
      await postTweet(text, lang, keys);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 모든 작업 완료');
  } catch (error) {
    console.error('❌ 봇 실행 중 치명적 오류:', error);
    process.exit(1);
  }
}

run();
