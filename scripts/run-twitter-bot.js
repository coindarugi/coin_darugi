const { TwitterApi } = require('twitter-api-v2');

// 사이트 URL
const SITE_URL = 'https://crypto-darugi.com/';

// 언어 설정 및 홍보 문구
const LANGUAGES = {
  ko: { 
    name: '한국어', 
    currency: 'krw', 
    symbol: '₩', 
    hashtags: '#비트코인 #김치프리미엄 #업비트 #코인전망 #투자',
    promotion: '⚡ 10,000+ 코인 실시간 시세와 AI 전망을 한눈에!\n💎 암호화폐 투자의 필수품, 크립토 대시보드'
  },
  en: { 
    name: 'English', 
    currency: 'usd', 
    symbol: '$', 
    hashtags: '#Bitcoin #Crypto #Trading #Invest #AI',
    promotion: '🚀 Track 10,000+ coins real-time & Check AI Forecasts!\n💎 Your all-in-one Cryptocurrency Dashboard.\n\n✅ AI-powered Market Analysis\n✅ Real-time Portfolio Tracker\n✅ Global Exchange Prices'
  },
  fr: { 
    name: 'Français', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Crypto #Trading #Finance #IA',
    promotion: '🚀 Suivez 10 000+ cryptos en temps réel & Prévisions IA !\n💎 Votre tableau de bord crypto tout-en-un.\n\n✅ Analyse de marché par IA\n✅ Suivi de portefeuille en temps réel'
  },
  de: { 
    name: 'Deutsch', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Krypto #Trading #Investieren #KI',
    promotion: '🚀 Echtzeit-Kurse für 10.000+ Coins & KI-Prognosen!\n💎 Ihr All-in-One Krypto-Dashboard.\n\n✅ KI-gestützte Marktanalyse\n✅ Echtzeit-Portfolio-Tracker'
  },
  es: { 
    name: 'Español', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Cripto #Trading #Inversión #IA',
    promotion: '🚀 ¡Sigue más de 10,000 monedas y pronósticos de IA!\n💎 Tu panel de control de criptomonedas todo en uno.\n\n✅ Análisis de mercado impulsado por IA\n✅ Rastreador de cartera en tiempo real'
  },
};

/**
 * 김치 프리미엄 데이터 조회
 */
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
    console.error('김프 조회 실패 (무시됨):', error.message);
    return null;
  }
}

/**
 * 트윗 텍스트 생성
 */
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

/**
 * 메인 실행 함수
 */
async function run() {
  console.log('🚀 GitHub Actions 트위터 봇 시작...');

  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;

  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    console.error('❌ 트위터 API 키가 설정되지 않았습니다.');
    process.exit(1);
  }

  const client = new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });

  try {
    const kimchiPremium = await getKimchiPremiumData();

    for (const lang of Object.keys(LANGUAGES)) {
      const text = createTweetText(kimchiPremium, lang);
      
      console.log(`\n🐦 [${lang}] 트윗 발행 중...`);
      console.log(text);
      
      try {
        const tweet = await client.v2.tweet(text);
        console.log(`✅ 성공! ID: ${tweet.data.id}`);
      } catch (e) {
        console.error(`❌ 실패: ${e.message}`);
      }
      
      // API 제한 방지
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 모든 작업 완료');
  } catch (error) {
    console.error('❌ 봇 실행 중 치명적 오류:', error);
    process.exit(1);
  }
}

run();
