import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';

// 사이트 URL
const SITE_URL = 'https://crypto-darugi.com/';

// 언어 설정
const LANGUAGES = {
  ko: { name: '한국어', currency: 'krw', symbol: '₩', hashtags: '#비트코인 #BTC #암호화폐 #AI분석' },
  en: { name: 'English', currency: 'usd', symbol: '$', hashtags: '#Bitcoin #BTC #Crypto #AIAnalysis' },
  fr: { name: 'Français', currency: 'eur', symbol: '€', hashtags: '#Bitcoin #BTC #Crypto #AnalyseIA' },
  de: { name: 'Deutsch', currency: 'eur', symbol: '€', hashtags: '#Bitcoin #BTC #Krypto #KIAnalyse' },
  es: { name: 'Español', currency: 'eur', symbol: '€', hashtags: '#Bitcoin #BTC #Cripto #AnálisisIA' },
};

/**
 * CoinGecko에서 비트코인 데이터 가져오기
 */
async function getBitcoinData() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false'
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API 오류: ${response.status}`);
  }
  
  const data = await response.json();
  
  // 데이터 검증
  if (!data?.market_data?.current_price) {
    throw new Error('CoinGecko API 응답에 market_data가 없습니다');
  }
  
  return {
    prices: {
      usd: data.market_data.current_price.usd || 0,
      krw: data.market_data.current_price.krw || 0,
      eur: data.market_data.current_price.eur || 0,
    },
    priceChange24h: data.market_data.price_change_percentage_24h || 0,
    volumes: {
      usd: data.market_data.total_volume.usd || 0,
      krw: data.market_data.total_volume.krw || 0,
      eur: data.market_data.total_volume.eur || 0,
    },
    highs: {
      usd: data.market_data.high_24h.usd || 0,
      krw: data.market_data.high_24h.krw || 0,
      eur: data.market_data.high_24h.eur || 0,
    },
    lows: {
      usd: data.market_data.low_24h.usd || 0,
      krw: data.market_data.low_24h.krw || 0,
      eur: data.market_data.low_24h.eur || 0,
    },
  };
}

/**
 * 숫자 포맷팅 (천 단위 콤마, 화폐별)
 */
function formatNumber(num: number, currency = 'usd', symbol = '$') {
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
async function generateAIAnalysis(bitcoinData: any, language: string, openaiApiKey: string) {
  const currency = LANGUAGES[language as keyof typeof LANGUAGES].currency;
  const symbol = LANGUAGES[language as keyof typeof LANGUAGES].symbol;
  
  const price = bitcoinData.prices[currency];
  const high = bitcoinData.highs[currency];
  const low = bitcoinData.lows[currency];
  
  const prompts: Record<string, string> = {
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

  const openai = new OpenAI({ apiKey: openaiApiKey });

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

  return completion.choices[0].message.content?.trim() || '';
}

/**
 * 트윗 텍스트 생성
 */
function createTweetText(bitcoinData: any, aiAnalysis: string, language: string) {
  const currency = LANGUAGES[language as keyof typeof LANGUAGES].currency;
  const symbol = LANGUAGES[language as keyof typeof LANGUAGES].symbol;
  const priceEmoji = bitcoinData.priceChange24h >= 0 ? '↑' : '↓';
  
  const price = bitcoinData.prices[currency];
  const volume = bitcoinData.volumes[currency];
  
  const warningTexts: Record<string, string> = {
    ko: '⚠️ 투자 판단은 신중히! 본 정보는 투자 조언이 아닙니다.',
    en: '⚠️ DYOR - Not financial advice.',
    fr: '⚠️ DYOR - Pas un conseil financier.',
    de: '⚠️ DYOR - Keine Finanzberatung.',
    es: '⚠️ DYOR - No es asesoramiento financiero.',
  };

  const titles: Record<string, string> = {
    ko: '🪙 비트코인(BTC) 오늘의 AI 분석',
    en: '🪙 Bitcoin(BTC) Daily AI Analysis',
    fr: '🪙 Bitcoin(BTC) Analyse IA du jour',
    de: '🪙 Bitcoin(BTC) Tägliche KI-Analyse',
    es: '🪙 Bitcoin(BTC) Análisis IA diario',
  };

  return `${titles[language]}

💰 ${formatNumber(price, currency, symbol)} (${priceEmoji}${Math.abs(bitcoinData.priceChange24h).toFixed(2)}%)
📊 24h Vol: ${formatNumber(volume, currency, symbol)}

🤖 ${aiAnalysis}

${warningTexts[language]}

🔗 ${SITE_URL}

${LANGUAGES[language as keyof typeof LANGUAGES].hashtags}`;
}

/**
 * 트윗 발행
 */
async function postTweet(text: string, language: string, twitterClient: TwitterApi) {
  const rwClient = twitterClient.readWrite;
  const tweet = await rwClient.v2.tweet(text);
  
  console.log(`✅ [${LANGUAGES[language as keyof typeof LANGUAGES].name}] 트윗 성공!`);
  console.log(`   트윗 ID: ${tweet.data.id}`);
  console.log(`   링크: https://twitter.com/i/web/status/${tweet.data.id}\n`);
  
  return tweet;
}

/**
 * 메인 봇 실행 함수 (환경 변수로부터 API 키 받음)
 */
export async function runCryptoBot(env: {
  TWITTER_API_KEY: string;
  TWITTER_API_SECRET: string;
  TWITTER_ACCESS_TOKEN: string;
  TWITTER_ACCESS_SECRET: string;
  OPENAI_API_KEY: string;
}) {
  console.log('🚀 5개 언어 자동 트윗 봇 시작...\n');
  console.log(`⏰ 실행 시간: ${new Date().toISOString()}\n`);

  try {
    // X API 클라이언트 생성
    const twitterClient = new TwitterApi({
      appKey: env.TWITTER_API_KEY,
      appSecret: env.TWITTER_API_SECRET,
      accessToken: env.TWITTER_ACCESS_TOKEN,
      accessSecret: env.TWITTER_ACCESS_SECRET,
    });

    // 1. 비트코인 데이터 가져오기
    console.log('1️⃣ 비트코인 데이터 가져오는 중...');
    const bitcoinData = await getBitcoinData();
    console.log(`✅ 현재가: ${formatNumber(bitcoinData.prices.usd, 'usd', '$')} (${bitcoinData.priceChange24h >= 0 ? '+' : ''}${bitcoinData.priceChange24h.toFixed(2)}%)\n`);

    // 2. 각 언어별로 트윗 생성 및 발행
    for (const [langCode, langInfo] of Object.entries(LANGUAGES)) {
      console.log(`📝 [${langInfo.name}] AI 분석 생성 중...`);
      const aiAnalysis = await generateAIAnalysis(bitcoinData, langCode, env.OPENAI_API_KEY);
      console.log(`✅ [${langInfo.name}] AI 분석 완료\n`);

      const tweetText = createTweetText(bitcoinData, aiAnalysis, langCode);
      
      console.log(`🐦 [${langInfo.name}] 트윗 발행 중...`);
      console.log('─'.repeat(50));
      console.log(tweetText);
      console.log('─'.repeat(50));
      
      await postTweet(tweetText, langCode, twitterClient);

      // 다음 트윗까지 2초 대기 (API 제한 방지)
      if (langCode !== 'es') {
        console.log('⏳ 2초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 모든 트윗 발행 완료!');
    console.log(`📊 총 ${Object.keys(LANGUAGES).length}개 언어로 트윗 발행됨`);
    
    return { success: true, message: '모든 트윗 발행 완료' };
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    throw error;
  }
}
