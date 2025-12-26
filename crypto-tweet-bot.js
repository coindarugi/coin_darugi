import { TwitterApi } from 'twitter-api-v2';
import { readFileSync } from 'fs';

// .dev.vars 파일 읽기
const envContent = readFileSync('.dev.vars', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// X API 클라이언트
const twitterClient = new TwitterApi({
  appKey: envVars.TWITTER_API_KEY,
  appSecret: envVars.TWITTER_API_SECRET,
  accessToken: envVars.TWITTER_ACCESS_TOKEN,
  accessSecret: envVars.TWITTER_ACCESS_SECRET,
});
const rwClient = twitterClient.readWrite;

// 사이트 URL
const SITE_URL = 'https://crypto-darugi.com/';

// 언어 설정
const LANGUAGES = {
  ko: { name: '한국어', hashtags: '#암호화폐 #비트코인 #코인추적 #무료대시보드' },
  en: { name: 'English', hashtags: '#Crypto #Bitcoin #Dashboard #FreeTool' },
  fr: { name: 'Français', hashtags: '#Crypto #Bitcoin #Dashboard #Gratuit' },
  de: { name: 'Deutsch', hashtags: '#Krypto #Bitcoin #Dashboard #Kostenlos' },
  es: { name: 'Español', hashtags: '#Cripto #Bitcoin #Dashboard #Gratis' },
};

/**
 * 웹사이트 홍보 트윗 텍스트 생성
 */
function createTweetText(language) {
  // 웹사이트 주요 기능 (언어별)
  const features = {
    ko: [
      '✨ 10,000개 이상 암호화폐 실시간 추적',
      '🤖 AI 기반 코인 전망 분석',
      '💰 3개 한국 거래소 가격 비교 + 김치 프리미엄',
      '📊 포트폴리오 관리 & 수익률 계산',
      '📰 실시간 뉴스 + 자동 번역',
      '🏆 Top 100 코인 브라우저 (시총/거래량/등락률순)',
      '💯 100% 무료!'
    ],
    en: [
      '✨ Track 10,000+ cryptocurrencies in real-time',
      '🤖 AI-powered coin forecast analysis',
      '💰 Compare 3 US exchange prices',
      '📊 Portfolio management & profit tracking',
      '📰 Real-time crypto news',
      '🏆 Top 100 coins browser (by market cap/volume/change)',
      '💯 100% FREE!'
    ],
    fr: [
      '✨ Suivez 10 000+ cryptomonnaies en temps réel',
      '🤖 Analyse de prévisions IA',
      '💰 Comparez les prix de 3 bourses européennes',
      '📊 Gestion de portefeuille',
      '📰 Actualités crypto + traduction',
      '🏆 Navigateur Top 100 (cap./volume/variation)',
      '💯 100% GRATUIT!'
    ],
    de: [
      '✨ 10.000+ Kryptowährungen in Echtzeit',
      '🤖 KI-gestützte Prognoseanalyse',
      '💰 Vergleichen Sie 3 EU-Börsenpreise',
      '📊 Portfolio-Management',
      '📰 Krypto-News + Übersetzung',
      '🏆 Top 100 Coin-Browser (Kap./Volumen/Änderung)',
      '💯 100% KOSTENLOS!'
    ],
    es: [
      '✨ Sigue 10,000+ criptomonedas en tiempo real',
      '🤖 Análisis de pronósticos IA',
      '💰 Compara precios de 3 exchanges europeos',
      '📊 Gestión de cartera',
      '📰 Noticias crypto + traducción',
      '🏆 Navegador Top 100 (cap./volumen/cambio)',
      '💯 ¡100% GRATIS!'
    ]
  };

  const titles = {
    ko: '🚀 암호화폐 실시간 대시보드',
    en: '🚀 Crypto Real-time Dashboard',
    fr: '🚀 Tableau de bord crypto en temps réel',
    de: '🚀 Krypto-Echtzeit-Dashboard',
    es: '🚀 Panel de control cripto en tiempo real',
  };

  const ctas = {
    ko: '👉 지금 무료로 사용해보세요!',
    en: '👉 Try it now for FREE!',
    fr: '👉 Essayez-le gratuitement maintenant!',
    de: '👉 Jetzt kostenlos testen!',
    es: '👉 ¡Pruébalo gratis ahora!',
  };

  // 랜덤으로 3개 기능 선택 (매번 다르게)
  const selectedFeatures = features[language]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return `${titles[language]}

${selectedFeatures.join('\n')}

${ctas[language]}

🔗 ${SITE_URL}

${LANGUAGES[language].hashtags}`;
}

/**
 * 트윗 발행
 */
async function postTweet(text, language) {
  try {
    const tweet = await rwClient.v2.tweet(text);
    console.log(`✅ [${LANGUAGES[language].name}] 트윗 성공!`);
    console.log(`   트윗 ID: ${tweet.data.id}`);
    console.log(`   링크: https://twitter.com/i/web/status/${tweet.data.id}\n`);
    return tweet;
  } catch (error) {
    console.error(`❌ [${LANGUAGES[language].name}] 트윗 실패:`, error.message);
    
    // Rate limit 정보 표시
    if (error.rateLimit) {
      console.log(`   Rate Limit - Remaining: ${error.rateLimit.remaining}/${error.rateLimit.limit}`);
      if (error.rateLimit.day) {
        console.log(`   Daily Limit - Remaining: ${error.rateLimit.day.remaining}/${error.rateLimit.day.limit}`);
      }
    }
    
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 웹사이트 홍보 트윗 봇 시작...\n');
  console.log(`⏰ 실행 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`);

  try {
    // 각 언어별로 트윗 생성 및 발행
    for (const [langCode, langInfo] of Object.entries(LANGUAGES)) {
      console.log(`🐦 [${langInfo.name}] 트윗 생성 중...`);

      // 웹사이트 홍보 트윗 생성
      const tweetText = createTweetText(langCode);
      
      console.log('─'.repeat(50));
      console.log(tweetText);
      console.log('─'.repeat(50));
      
      await postTweet(tweetText, langCode);

      // 다음 트윗까지 3초 대기 (API 제한 방지)
      if (langCode !== 'es') {
        console.log('⏳ 3초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('\n🎉 모든 트윗 발행 완료!');
    console.log(`📊 총 ${Object.keys(LANGUAGES).length}개 언어로 트윗 발행됨`);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
main();
