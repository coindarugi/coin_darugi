import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
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

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: envVars.OPENAI_API_KEY,
});

// 사이트 URL
const SITE_URL = 'https://crypto-dashboard-secure.pages.dev/';

// 언어 설정
const LANGUAGES = {
  ko: { name: '한국어', currency: 'krw', symbol: '₩', hashtags: '#암호화폐 #비트코인 #코인추적 #무료대시보드' },
  en: { name: 'English', currency: 'usd', symbol: '$', hashtags: '#Crypto #Bitcoin #Dashboard #FreeTool' },
  fr: { name: 'Français', currency: 'eur', symbol: '€', hashtags: '#Crypto #Bitcoin #Dashboard #Gratuit' },
  de: { name: 'Deutsch', currency: 'eur', symbol: '€', hashtags: '#Krypto #Bitcoin #Dashboard #Kostenlos' },
  es: { name: 'Español', currency: 'eur', symbol: '€', hashtags: '#Cripto #Bitcoin #Dashboard #Gratis' },
};

/**
 * CoinGecko에서 비트코인 데이터 가져오기
 */
async function getBitcoinData() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false'
    );
    const data = await response.json();
    
    return {
      prices: {
        usd: data.market_data.current_price.usd,
        krw: data.market_data.current_price.krw,
        eur: data.market_data.current_price.eur,
      },
      priceChange24h: data.market_data.price_change_percentage_24h,
      volumes: {
        usd: data.market_data.total_volume.usd,
        krw: data.market_data.total_volume.krw,
        eur: data.market_data.total_volume.eur,
      },
      highs: {
        usd: data.market_data.high_24h.usd,
        krw: data.market_data.high_24h.krw,
        eur: data.market_data.high_24h.eur,
      },
      lows: {
        usd: data.market_data.low_24h.usd,
        krw: data.market_data.low_24h.krw,
        eur: data.market_data.low_24h.eur,
      },
    };
  } catch (error) {
    console.error('❌ CoinGecko API 오류:', error.message);
    throw error;
  }
}

/**
 * 숫자 포맷팅 (천 단위 콤마, 화폐별)
 */
function formatNumber(num, currency = 'usd', symbol = '$') {
  // 한국 원화는 소수점 없음
  if (currency === 'krw') {
    if (num >= 1_000_000_000_000) {
      return `${symbol}${(num / 1_000_000_000_000).toFixed(2)}조`;
    } else if (num >= 100_000_000) {
      return `${symbol}${(num / 100_000_000).toFixed(2)}억`;
    } else if (num >= 10_000) {
      return `${symbol}${(num / 10_000).toFixed(0)}만`;
    } else {
      return `${symbol}${Math.round(num).toLocaleString('ko-KR')}`;
    }
  }
  
  // USD, EUR은 소수점 포함
  if (num >= 1_000_000_000) {
    return `${symbol}${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
  } else {
    const locale = currency === 'eur' ? 'de-DE' : 'en-US';
    return `${symbol}${num.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
}

/**
 * OpenAI로 다국어 AI 분석 생성
 */
async function generateAIAnalysis(bitcoinData, language) {
  const currency = LANGUAGES[language].currency;
  const symbol = LANGUAGES[language].symbol;
  
  const price = bitcoinData.prices[currency];
  const high = bitcoinData.highs[currency];
  const low = bitcoinData.lows[currency];
  
  const prompts = {
    ko: `당신은 암호화폐 전문 분석가입니다. 다음 비트코인 데이터를 바탕으로 간결하고 전문적인 분석을 작성하세요.

데이터:
- 현재가: ${formatNumber(price, currency, symbol)}
- 24시간 변동: ${bitcoinData.priceChange24h.toFixed(2)}%
- 24시간 최고가: ${formatNumber(high, currency, symbol)}
- 24시간 최저가: ${formatNumber(low, currency, symbol)}

요구사항:
- 2-3문장으로 간결하게
- 기술적 분석 포함
- 투자 조언 아님, 정보 제공만
- 이모지 사용 금지`,

    en: `You are a cryptocurrency expert analyst. Write a concise and professional analysis based on the following Bitcoin data.

Data:
- Current Price: ${formatNumber(price, currency, symbol)}
- 24h Change: ${bitcoinData.priceChange24h.toFixed(2)}%
- 24h High: ${formatNumber(high, currency, symbol)}
- 24h Low: ${formatNumber(low, currency, symbol)}

Requirements:
- 2-3 sentences, concise
- Include technical analysis
- Not investment advice, information only
- No emojis`,

    fr: `Vous êtes un analyste expert en cryptomonnaies. Rédigez une analyse concise et professionnelle basée sur les données Bitcoin suivantes.

Données:
- Prix actuel: ${formatNumber(price, currency, symbol)}
- Variation 24h: ${bitcoinData.priceChange24h.toFixed(2)}%
- Plus haut 24h: ${formatNumber(high, currency, symbol)}
- Plus bas 24h: ${formatNumber(low, currency, symbol)}

Exigences:
- 2-3 phrases, concis
- Inclure une analyse technique
- Pas de conseil d'investissement, information uniquement
- Pas d'émojis`,

    de: `Sie sind ein Kryptowährungs-Experte. Schreiben Sie eine prägnante und professionelle Analyse basierend auf den folgenden Bitcoin-Daten.

Daten:
- Aktueller Preis: ${formatNumber(price, currency, symbol)}
- 24h Änderung: ${bitcoinData.priceChange24h.toFixed(2)}%
- 24h Hoch: ${formatNumber(high, currency, symbol)}
- 24h Tief: ${formatNumber(low, currency, symbol)}

Anforderungen:
- 2-3 Sätze, prägnant
- Technische Analyse einbeziehen
- Keine Anlageberatung, nur Informationen
- Keine Emojis`,

    es: `Eres un analista experto en criptomonedas. Escribe un análisis conciso y profesional basado en los siguientes datos de Bitcoin.

Datos:
- Precio actual: ${formatNumber(price, currency, symbol)}
- Cambio 24h: ${bitcoinData.priceChange24h.toFixed(2)}%
- Máximo 24h: ${formatNumber(high, currency, symbol)}
- Mínimo 24h: ${formatNumber(low, currency, symbol)}

Requisitos:
- 2-3 oraciones, conciso
- Incluir análisis técnico
- No es asesoramiento de inversión, solo información
- Sin emojis`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional cryptocurrency analyst providing factual market analysis.',
        },
        {
          role: 'user',
          content: prompts[language],
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ OpenAI API 오류 (${language}):`, error.message);
    throw error;
  }
}

/**
 * 웹사이트 홍보 트윗 텍스트 생성
 */
function createTweetText(bitcoinData, aiAnalysis, language) {
  const currency = LANGUAGES[language].currency;
  const symbol = LANGUAGES[language].symbol;
  
  // 웹사이트 주요 기능 (언어별)
  const features = {
    ko: [
      '✨ 10,000개 이상 암호화폐 실시간 추적',
      '🤖 AI 기반 코인 전망 분석 (GPT-5.2)',
      '💰 김치 프리미엄 계산기 (업비트/빗썸/코인원)',
      '📊 포트폴리오 관리 & 수익률 계산',
      '📰 실시간 뉴스 + 자동 번역',
      '🌍 5개 언어 완벽 지원'
    ],
    en: [
      '✨ Track 10,000+ cryptocurrencies in real-time',
      '🤖 AI-powered coin forecast (GPT-5.2)',
      '📊 Portfolio management & profit tracking',
      '📰 Real-time crypto news + translation',
      '🌍 5 languages supported',
      '💯 100% FREE!'
    ],
    fr: [
      '✨ Suivez 10 000+ cryptomonnaies en temps réel',
      '🤖 Prévisions IA (GPT-5.2)',
      '📊 Gestion de portefeuille',
      '📰 Actualités crypto + traduction',
      '🌍 5 langues supportées',
      '💯 100% GRATUIT!'
    ],
    de: [
      '✨ 10.000+ Kryptowährungen in Echtzeit',
      '🤖 KI-Prognosen (GPT-5.2)',
      '📊 Portfolio-Management',
      '📰 Krypto-News + Übersetzung',
      '🌍 5 Sprachen unterstützt',
      '💯 100% KOSTENLOS!'
    ],
    es: [
      '✨ Sigue 10,000+ criptomonedas en tiempo real',
      '🤖 Pronósticos IA (GPT-5.2)',
      '📊 Gestión de cartera',
      '📰 Noticias crypto + traducción',
      '🌍 5 idiomas compatibles',
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

      // 웹사이트 홍보 트윗 생성 (비트코인 데이터 필요 없음)
      const tweetText = createTweetText(null, null, langCode);
      
      console.log('─'.repeat(50));
      console.log(tweetText);
      console.log('─'.repeat(50));
      
      await postTweet(tweetText, langCode);

      // 다음 트윗까지 2초 대기 (API 제한 방지)
      if (langCode !== 'es') {
        console.log('⏳ 2초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
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
