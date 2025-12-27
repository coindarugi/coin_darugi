import { TwitterApi } from 'twitter-api-v2';

// 사이트 URL
const SITE_URL = 'https://crypto-darugi.com/';

// 언어 설정 및 홍보 문구 (매력적인 문구로 개선)
const LANGUAGES = {
  ko: { 
    name: '한국어', 
    currency: 'krw', 
    symbol: '₩', 
    hashtags: '#비트코인 #김치프리미엄 #업비트 #투자 #재테크',
    promotion: '🔥 남들보다 먼저 확인하세요!\n✅ 실시간 김치 프리미엄 & AI 가격 전망\n✅ 10,000+ 코인 시세 및 차트 분석\n\n👉 100% 무료 대시보드 바로가기'
  },
  en: { 
    name: 'English', 
    currency: 'usd', 
    symbol: '$', 
    hashtags: '#Bitcoin #Crypto #Trading #AI #Investment',
    promotion: '🚀 Don\'t miss the market trends!\n✅ Real-time Prices for 10,000+ Coins\n✅ AI-Powered Price Forecasts\n✅ Professional Portfolio Management\n\n👉 Free Crypto Dashboard Here'
  },
  fr: { 
    name: 'Français', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Crypto #Finance #Investissement #IA',
    promotion: '🚀 Suivez le marché en temps réel !\n✅ Cours de 10 000+ Cryptos\n✅ Prévisions de Prix par IA\n✅ Gestion de Portefeuille Pro\n\n👉 Tableau de bord Gratuit'
  },
  de: { 
    name: 'Deutsch', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Krypto #Finanzen #Investieren #KI',
    promotion: '🚀 Verpassen Sie keinen Trend!\n✅ Echtzeit-Kurse für 10.000+ Coins\n✅ KI-gestützte Preisprognosen\n✅ Professionelles Portfolio-Management\n\n👉 Kostenloses Krypto-Dashboard'
  },
  es: { 
    name: 'Español', 
    currency: 'eur', 
    symbol: '€', 
    hashtags: '#Bitcoin #Cripto #Finanzas #Inversión #IA',
    promotion: '🚀 ¡Domina el mercado cripto!\n✅ Precios de 10,000+ Monedas\n✅ Pronósticos de Precios con IA\n✅ Gestión de Cartera Profesional\n\n👉 Panel de Control Gratuito'
  },
};

/**
 * CoinGecko에서 비트코인 글로벌 데이터 가져오기
 */
async function getGlobalData() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false'
    );
    
    if (!response.ok) throw new Error(`CoinGecko API Error: ${response.status}`);
    const data = await response.json();
    
    return {
      prices: {
        usd: data.market_data.current_price.usd,
        krw: data.market_data.current_price.krw,
        eur: data.market_data.current_price.eur,
      },
      change24h: data.market_data.price_change_percentage_24h,
    };
  } catch (error) {
    console.error('글로벌 데이터 조회 실패:', error);
    return null;
  }
}

/**
 * 업비트에서 비트코인 가격 가져오기 (김치 프리미엄 계산용)
 */
async function getUpbitPrice() {
  try {
    const response = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    if (!response.ok) throw new Error(`Upbit API Error: ${response.status}`);
    const data = await response.json();
    return data[0].trade_price;
  } catch (error) {
    console.error('업비트 시세 조회 실패:', error);
    return null;
  }
}

/**
 * 숫자 포맷팅
 */
function formatNumber(num: number, currency = 'usd', symbol = '$') {
  if (currency === 'krw') {
    return `${symbol}${Math.round(num).toLocaleString('ko-KR')}`;
  }
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * 트윗 텍스트 생성
 */
function createTweetText(globalData: any, upbitPrice: number | null, language: string) {
  const langConfig = LANGUAGES[language as keyof typeof LANGUAGES];
  const currency = langConfig.currency;
  const symbol = langConfig.symbol;
  
  const globalPrice = globalData.prices[currency];
  const changeEmoji = globalData.change24h >= 0 ? '📈' : '📉';
  const changeSign = globalData.change24h >= 0 ? '+' : '';
  
  let content = '';
  
  // 1. 헤더 (비트코인 현재가)
  content += `💎 Bitcoin (BTC) ${changeEmoji}\n\n`;
  
  // 2. 가격 정보
  if (language === 'ko' && upbitPrice) {
    // 한국어: 김치 프리미엄 포함
    const kimchiPremium = ((upbitPrice - globalData.prices.krw) / globalData.prices.krw) * 100;
    const premiumEmoji = kimchiPremium >= 0 ? '🔴' : '🔵'; // 양수면 김프(빨강), 음수면 역프
    const premiumText = kimchiPremium >= 0 ? '김치 프리미엄' : '역프리미엄';
    
    content += `🇰🇷 업비트: ${formatNumber(upbitPrice, 'krw', '₩')}\n`;
    content += `🌶️ ${premiumText}: ${premiumEmoji} ${changeSign}${kimchiPremium.toFixed(2)}%\n\n`;
  } else {
    // 글로벌: 해당 통화 가격만 표시
    content += `💰 Price: ${formatNumber(globalPrice, currency, symbol)}\n`;
    content += `📊 24h Change: ${changeSign}${globalData.change24h.toFixed(2)}%\n\n`;
  }
  
  // 3. 홍보 문구 (핵심)
  content += `${langConfig.promotion}\n\n`;
  
  // 4. 링크 및 해시태그 (강조)
  const ctaText = language === 'ko' ? '👉 무료 대시보드 확인하기:' : '👉 Visit Free Dashboard:';
  
  // 언어별 URL 생성 (한국어는 기본, 나머지는 파라미터 추가)
  const targetUrl = language === 'ko' ? SITE_URL : `${SITE_URL}?lang=${language}`;
  
  content += `${ctaText} ${targetUrl}\n\n`;
  content += langConfig.hashtags;
  
  return content;
}

/**
 * 트윗 발행 함수
 */
async function postTweet(text: string, language: string, twitterClient: TwitterApi) {
  try {
    const tweet = await twitterClient.v2.tweet(text);
    console.log(`✅ [${language}] 트윗 성공! ID: ${tweet.data.id}`);
    return true;
  } catch (error) {
    console.error(`❌ [${language}] 트윗 실패:`, error);
    return false;
  }
}

/**
 * 메인 봇 실행 함수
 */
export async function runCryptoBot(env: {
  TWITTER_API_KEY: string;
  TWITTER_API_SECRET: string;
  TWITTER_ACCESS_TOKEN: string;
  TWITTER_ACCESS_SECRET: string;
  OPENAI_API_KEY?: string; // 사용 안 함
}) {
  console.log('🚀 암호화폐 홍보 봇 시작...\n');

  try {
    // 1. 데이터 수집
    const globalData = await getGlobalData();
    if (!globalData) throw new Error('글로벌 데이터 조회 실패');
    
    const upbitPrice = await getUpbitPrice(); // 한국어 트윗용

    // 2. 트위터 클라이언트
    const twitterClient = new TwitterApi({
      appKey: env.TWITTER_API_KEY,
      appSecret: env.TWITTER_API_SECRET,
      accessToken: env.TWITTER_ACCESS_TOKEN,
      accessSecret: env.TWITTER_ACCESS_SECRET,
    });

    // 3. 언어별 트윗 발행
    for (const lang of Object.keys(LANGUAGES)) {
      const text = createTweetText(globalData, upbitPrice, lang);
      
      console.log(`\n📄 [${lang}] 트윗 미리보기:`);
      console.log('-----------------------------------');
      console.log(text);
      console.log('-----------------------------------');
      
      await postTweet(text, lang, twitterClient);
      
      // API 제한 방지 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return { success: true };
  } catch (error) {
    console.error('봇 실행 중 치명적 오류:', error);
    throw error;
  }
}
