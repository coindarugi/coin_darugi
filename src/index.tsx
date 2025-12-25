import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { runCryptoBot } from './crypto-bot'

// 환경 변수 타입 정의
type Bindings = {
  OPENAI_API_KEY?: string
  TWITTER_API_KEY?: string
  TWITTER_API_SECRET?: string
  TWITTER_ACCESS_TOKEN?: string
  TWITTER_ACCESS_SECRET?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 🔑 CoinGecko API Key (Pro Plan)
const COINGECKO_API_KEY = 'CG-bEbJV8BdVqdiC9EZWHDhiWBt'
const COINGECKO_API_URL = 'https://pro-api.coingecko.com/api/v3'

// 🤖 AI 전망 캐시 (5분 - 베이직 플랜)
const aiForecastCache = {
  data: null as any,
  timestamp: 0,
  ttl: 300000, // 5분 (베이직 플랜으로 더 자주 갱신)
  version: 4 // 버전 변경으로 캐시 무효화 (GPT-5.2 + 상세 분석)
}

// 🔥 캐시 시간 단축 (Pro API는 더 자주 갱신 가능)
// 간단한 메모리 캐시 (5분 - Pro API 활용)
const priceCache = {
  data: null as any,
  timestamp: 0,
  ttl: 300000 // 5분 (Pro API는 빠른 갱신 가능)
}

// 코인 목록 캐시 (1시간)
const coinsListCache = {
  data: null as any,
  timestamp: 0,
  ttl: 3600000 // 1시간
}

// 김치 프리미엄 캐시 (3분)
const kimchiPremiumCache = {
  data: null as any,
  timestamp: 0,
  ttl: 180000 // 3분
}

// 차트 데이터 캐시 (5분)
const chartCache = {
  data: {} as any,
  ttl: 300000 // 5분
}

// 공포탐욕지수 캐시 (30분)
const fearGreedCache = {
  data: null as any,
  timestamp: 0,
  ttl: 1800000 // 30분
}

// 뉴스 캐시 (5분)
const newsCache = {
  data: null as any,
  timestamp: 0,
  ttl: 300000 // 5분
}

// CORS 활성화
app.use('/api/*', cors())

// 🆕 CoinCap API 매핑 (백업용)
const coinCapMapping: Record<string, string> = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'ripple': 'ripple',
  'cardano': 'cardano',
  'solana': 'solana',
  'polkadot': 'polkadot',
  'dogecoin': 'dogecoin',
  'shiba-inu': 'shiba-inu',
  'polygon': 'polygon-matic',
  'litecoin': 'litecoin',
  'binancecoin': 'binance-coin',
  'avalanche-2': 'avalanche',
  'chainlink': 'chainlink',
  'stellar': 'stellar',
  'uniswap': 'uniswap'
}

// 🆕 CoinCap API로 가격 가져오기 (백업)
async function fetchFromCoinCap(coinIds: string[]) {
  try {
    const results: any = {}
    
    // CoinCap은 단일 코인만 조회 가능하므로 병렬로 호출
    const promises = coinIds.map(async (coinId) => {
      const coinCapId = coinCapMapping[coinId]
      if (!coinCapId) return
      
      const response = await fetch(`https://api.coincap.io/v2/assets/${coinCapId}`)
      if (!response.ok) return
      
      const json = await response.json()
      const coin = json.data
      
      if (coin) {
        const usdPrice = parseFloat(coin.priceUsd)
        const change24h = parseFloat(coin.changePercent24Hr)
        const marketCap = parseFloat(coin.marketCapUsd)
        
        // KRW 환율 적용 (1400원 고정 - 실시간 환율 API 없음)
        const krwPrice = usdPrice * 1400
        
        results[coinId] = {
          usd: usdPrice,
          usd_market_cap: marketCap,
          usd_24h_change: change24h,
          krw: krwPrice,
          krw_market_cap: marketCap * 1400,
          krw_24h_change: change24h
        }
      }
    })
    
    await Promise.all(promises)
    return results
  } catch (error) {
    console.error('CoinCap API error:', error)
    return null
  }
}

// API 라우트: 암호화폐 실시간 가격 조회 (선택한 코인만)
app.get('/api/prices', async (c) => {
  try {
    // URL 쿼리에서 선택한 코인 가져오기 (기본값: 비트코인만)
    const selectedCoins = c.req.query('coins') || 'bitcoin'
    
    // 캐시 체크
    const now = Date.now()
    if (priceCache.data && (now - priceCache.timestamp) < priceCache.ttl) {
      console.log('✅ Returning cached data')
      // 캐시된 데이터에서 선택한 코인만 필터링
      const filteredData: any = {}
      selectedCoins.split(',').forEach(coin => {
        if (priceCache.data[coin]) {
          filteredData[coin] = priceCache.data[coin]
        }
      })
      return c.json(filteredData)
    }
    
    // 모든 코인 데이터를 한 번에 가져와서 캐시
    const allCoins = 'bitcoin,ethereum,ripple,cardano,solana,polkadot,dogecoin,shiba-inu,polygon,litecoin,binancecoin,avalanche-2,chainlink,stellar,uniswap'
    
    console.log('🔄 Fetching from CoinGecko Pro API...')
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${allCoins}&vs_currencies=usd,krw&include_24hr_change=true&include_market_cap=true`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-pro-api-key': COINGECKO_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      console.error('❌ CoinGecko API error:', response.status, response.statusText)
      
      // 429 에러인 경우: 1) 캐시 반환 2) CoinCap 백업 시도
      if (response.status === 429) {
        console.warn('⚠️ Rate limit exceeded!')
        
        // 먼저 캐시된 데이터 확인
        if (priceCache.data) {
          console.log('✅ Returning cached data (stale)')
          const filteredData: any = {}
          selectedCoins.split(',').forEach(coin => {
            if (priceCache.data[coin]) {
              filteredData[coin] = priceCache.data[coin]
            }
          })
          return c.json(filteredData)
        }
        
        // 캐시도 없으면 CoinCap API 시도
        console.log('🔄 Trying CoinCap API as backup...')
        const coinCapData = await fetchFromCoinCap(allCoins.split(','))
        
        if (coinCapData && Object.keys(coinCapData).length > 0) {
          console.log('✅ CoinCap API success!')
          
          // 캐시 업데이트
          priceCache.data = coinCapData
          priceCache.timestamp = now
          
          // 선택한 코인만 필터링
          const filteredData: any = {}
          selectedCoins.split(',').forEach(coin => {
            if (coinCapData[coin]) {
              filteredData[coin] = coinCapData[coin]
            }
          })
          return c.json(filteredData)
        }
      }
      
      throw new Error(`API 요청 실패: ${response.status}`)
    }
    
    console.log('✅ CoinGecko API success - Cache updated')
    const data = await response.json()
    
    // 빈 응답 체크
    if (Object.keys(data).length === 0) {
      throw new Error('데이터 없음')
    }
    
    // 캐시 업데이트
    priceCache.data = data
    priceCache.timestamp = now
    
    // 선택한 코인만 필터링해서 반환
    const filteredData: any = {}
    selectedCoins.split(',').forEach(coin => {
      if (data[coin]) {
        filteredData[coin] = data[coin]
      }
    })
    
    return c.json(filteredData)
  } catch (error) {
    console.error('❌ Price API error:', error)
    
    // 최후의 수단: 오래된 캐시라도 반환
    if (priceCache.data) {
      console.log('⚠️ Returning very stale cached data')
      const selectedCoins = c.req.query('coins') || 'bitcoin'
      const filteredData: any = {}
      selectedCoins.split(',').forEach(coin => {
        if (priceCache.data[coin]) {
          filteredData[coin] = priceCache.data[coin]
        }
      })
      return c.json(filteredData)
    }
    
    return c.json({ 
      error: '가격 정보를 가져올 수 없습니다.',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// API 라우트: 전체 코인 목록 (시가총액 기준 Top 100)
app.get('/api/coins/list', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const perPage = 100
    
    // 캐시 체크
    const now = Date.now()
    const cacheKey = `page_${page}`
    
    if (coinsListCache.data?.[cacheKey] && (now - coinsListCache.timestamp) < coinsListCache.ttl) {
      console.log('Returning cached coins list')
      return c.json(coinsListCache.data[cacheKey])
    }
    
    console.log('Fetching coins list from CoinGecko Pro API...')
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-pro-api-key': COINGECKO_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 캐시 업데이트
    if (!coinsListCache.data) {
      coinsListCache.data = {}
    }
    coinsListCache.data[cacheKey] = { coins: data }
    coinsListCache.timestamp = now
    
    return c.json({ coins: data })
  } catch (error) {
    console.error('Coins list API error:', error)
    return c.json({ 
      error: '코인 목록을 가져올 수 없습니다.',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// API 라우트: 코인 검색
app.get('/api/coins/search', async (c) => {
  try {
    const query = c.req.query('q') || ''
    
    if (query.length < 2) {
      return c.json({ coins: [] })
    }
    
    console.log('Searching coins:', query)
    const response = await fetch(
      `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-pro-api-key': COINGECKO_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`검색 실패: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 상위 20개만 반환
    const coins = data.coins.slice(0, 20).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      thumb: coin.thumb,
      market_cap_rank: coin.market_cap_rank
    }))
    
    return c.json({ coins })
  } catch (error) {
    console.error('Search API error:', error)
    return c.json({ 
      error: '검색 실패',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// API 라우트: 코인 차트 데이터 (7일/30일/90일 지원)
app.get('/api/chart/:coinId', async (c) => {
  try {
    const coinId = c.req.param('coinId')
    const days = c.req.query('days') || '7' // 기본값: 7일
    
    // 캐시 키
    const cacheKey = `${coinId}_${days}`
    const now = Date.now()
    
    // 캐시 체크
    if (chartCache.data[cacheKey] && (now - chartCache.data[cacheKey].timestamp) < chartCache.ttl) {
      console.log('Returning cached chart data')
      return c.json(chartCache.data[cacheKey].data)
    }
    
    console.log(`Fetching ${days} days chart data for ${coinId}...`)
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-pro-api-key': COINGECKO_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('차트 데이터 조회 실패')
    }
    
    const data = await response.json()
    
    // 캐시 업데이트
    chartCache.data[cacheKey] = {
      data: data,
      timestamp: now
    }
    
    return c.json(data)
  } catch (error) {
    console.error('Chart API error:', error)
    
    // 에러 발생 시 캐시된 데이터라도 반환
    const cacheKey = `${c.req.param('coinId')}_${c.req.query('days') || '7'}`
    if (chartCache.data[cacheKey]) {
      console.log('Returning stale cached chart data due to error')
      return c.json(chartCache.data[cacheKey].data)
    }
    
    return c.json({ error: '차트 데이터를 가져올 수 없습니다.' }, 500)
  }
})

// 코인 심볼 매핑 (CoinGecko ID → Upbit 심볼)
const coinSymbolMapping: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'solana': 'SOL',
  'polkadot': 'DOT',
  'dogecoin': 'DOGE',
  'shiba-inu': 'SHIB',
  'polygon': 'MATIC',
  'litecoin': 'LTC',
  'binancecoin': 'BNB',
  'avalanche-2': 'AVAX',
  'chainlink': 'LINK',
  'stellar': 'XLM',
  'uniswap': 'UNI',
  'tron': 'TRX',
  'eos': 'EOS',
  'aave': 'AAVE',
  'algorand': 'ALGO',
  'cosmos': 'ATOM'
}

// API 라우트: 김치 프리미엄 계산 (개별 코인 지원)
app.get('/api/kimchi-premium/:coinId', async (c) => {
  try {
    const coinId = c.req.param('coinId')
    const exchange = c.req.query('exchange') || 'upbit' // 기본값: 업비트
    
    // 캐시 키
    const cacheKey = `${exchange}_${coinId}_premium`
    const now = Date.now()
    
    // 캐시 체크
    if (kimchiPremiumCache.data?.[cacheKey] && (now - kimchiPremiumCache.timestamp) < kimchiPremiumCache.ttl) {
      console.log('Returning cached kimchi premium for', coinId)
      return c.json(kimchiPremiumCache.data[cacheKey])
    }
    
    // 코인 심볼 가져오기
    const symbol = coinSymbolMapping[coinId]
    if (!symbol) {
      return c.json({ error: '지원하지 않는 코인입니다.' }, 400)
    }
    
    let koreanPrice = 0
    let exchangeName = ''
    
    if (exchange === 'upbit') {
      // 업비트 가격
      const upbitResponse = await fetch(`https://api.upbit.com/v1/ticker?markets=KRW-${symbol}`)
      const upbitData = await upbitResponse.json()
      
      if (upbitData.length === 0 || upbitData[0].error) {
        return c.json({ error: '업비트에서 거래되지 않는 코인입니다.' }, 404)
      }
      
      koreanPrice = upbitData[0]?.trade_price || 0
      exchangeName = '업비트'
    } else if (exchange === 'bithumb') {
      // 빗썸 가격
      const bithumbResponse = await fetch(`https://api.bithumb.com/public/ticker/${symbol}_KRW`)
      const bithumbData = await bithumbResponse.json()
      
      if (bithumbData.status !== '0000') {
        return c.json({ error: '빗썸에서 거래되지 않는 코인입니다.' }, 404)
      }
      
      koreanPrice = parseFloat(bithumbData.data?.closing_price || 0)
      exchangeName = '빗썸'
    } else if (exchange === 'coinone') {
      // 코인원 가격
      const coinoneResponse = await fetch(`https://api.coinone.co.kr/ticker?currency=${symbol.toLowerCase()}`)
      const coinoneData = await coinoneResponse.json()
      
      if (coinoneData.result !== 'success') {
        return c.json({ error: '코인원에서 거래되지 않는 코인입니다.' }, 404)
      }
      
      koreanPrice = parseFloat(coinoneData.last || 0)
      exchangeName = '코인원'
    }
    
    // 가격 캐시에서 글로벌 KRW 가격 가져오기 (CoinGecko API 중복 호출 방지)
    let globalPrice = 0
    
    // 먼저 가격 캐시 확인
    if (priceCache.data && priceCache.data[coinId]?.krw) {
      globalPrice = priceCache.data[coinId].krw
    } else {
      // 캐시에 없으면 CoinGecko Pro API 호출
      try {
        const coingeckoResponse = await fetch(
          `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=krw`,
          {
            headers: {
              'Accept': 'application/json',
              'x-cg-pro-api-key': COINGECKO_API_KEY
            }
          }
        )
        
        if (coingeckoResponse.ok) {
          const coingeckoData = await coingeckoResponse.json()
          globalPrice = coingeckoData[coinId]?.krw || 0
        }
      } catch (error) {
        console.error('CoinGecko API error, using estimation:', error)
      }
    }
    
    // 글로벌 가격을 가져올 수 없는 경우 추정값 사용 (한국 가격의 98%)
    if (globalPrice === 0) {
      globalPrice = koreanPrice / 1.02
    }
    
    // 김치 프리미엄 계산
    const premium = ((koreanPrice - globalPrice) / globalPrice * 100).toFixed(2)
    
    const result = {
      coinId: coinId,
      symbol: symbol,
      exchange: exchangeName,
      koreanPrice: koreanPrice,
      globalPrice: Math.round(globalPrice),
      premium: parseFloat(premium.toString())
    }
    
    // 캐시 업데이트
    if (!kimchiPremiumCache.data) {
      kimchiPremiumCache.data = {}
    }
    kimchiPremiumCache.data[cacheKey] = result
    kimchiPremiumCache.timestamp = now
    
    return c.json(result)
  } catch (error) {
    console.error('Kimchi premium error:', error)
    return c.json({ error: '김치 프리미엄을 계산할 수 없습니다.' }, 500)
  }
})

// API 라우트: 비트코인 김치 프리미엄 (하위 호환성)
app.get('/api/kimchi-premium', async (c) => {
  const exchange = c.req.query('exchange') || 'upbit'
  return c.redirect(`/api/kimchi-premium/bitcoin?exchange=${exchange}`)
})

// API 라우트: 공포탐욕지수 (Fear & Greed Index)
app.get('/api/fear-greed', async (c) => {
  try {
    const now = Date.now()
    
    // 캐시 체크
    if (fearGreedCache.data && (now - fearGreedCache.timestamp) < fearGreedCache.ttl) {
      console.log('Returning cached fear & greed index')
      return c.json(fearGreedCache.data)
    }
    
    console.log('Fetching Fear & Greed Index...')
    const response = await fetch(
      'https://api.alternative.me/fng/?limit=1',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('공포탐욕지수 조회 실패')
    }
    
    const data = await response.json()
    const fngData = data.data[0]
    
    const result = {
      value: parseInt(fngData.value),
      classification: fngData.value_classification,
      timestamp: fngData.timestamp
    }
    
    // 캐시 업데이트
    fearGreedCache.data = result
    fearGreedCache.timestamp = now
    
    return c.json(result)
  } catch (error) {
    console.error('Fear & Greed Index error:', error)
    return c.json({ error: '공포탐욕지수를 가져올 수 없습니다.' }, 500)
  }
})

// API 라우트: 암호화폐 뉴스 (RSS 기반)
app.get('/api/news', async (c) => {
  try {
    const now = Date.now()
    
    // 캐시 체크
    if (newsCache.data && (now - newsCache.timestamp) < newsCache.ttl) {
      console.log('Returning cached crypto news')
      return c.json(newsCache.data)
    }
    
    console.log('Fetching crypto news from RSS feeds...')
    
    // CoinDesk RSS
    const coinDeskResponse = await fetch('https://www.coindesk.com/arc/outboundfeeds/rss/')
    const coinDeskXML = await coinDeskResponse.text()
    
    // RSS 파싱 (간단한 정규식 사용)
    const parseRSS = (xml: string, source: string) => {
      const items: any[] = []
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let match
      
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1]
        
        const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemContent) || 
                          /<title>(.*?)<\/title>/.exec(itemContent)
        const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent)
        const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent)
        const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(itemContent) ||
                         /<description>(.*?)<\/description>/.exec(itemContent)
        
        if (titleMatch && linkMatch) {
          let fullDescription = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
          
          // description이 원본 그대로 사용 (일반 설명 추가하지 않음)
          
          items.push({
            title: titleMatch[1].trim(),
            link: linkMatch[1].trim(),
            pubDate: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
            description: fullDescription,
            source: source
          })
        }
        
        if (items.length >= 10) break // 최대 10개
      }
      
      return items
    }
    
    const news = parseRSS(coinDeskXML, 'CoinDesk')
    
    // 날짜순 정렬
    news.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    
    const result = {
      news: news.slice(0, 20), // 최대 20개
      lastUpdate: new Date().toISOString()
    }
    
    // 캐시 업데이트
    newsCache.data = result
    newsCache.timestamp = now
    
    return c.json(result)
  } catch (error) {
    console.error('News API error:', error)
    
    // 에러 시 캐시된 데이터 반환
    if (newsCache.data) {
      console.log('Returning stale cached news due to error')
      return c.json(newsCache.data)
    }
    
    return c.json({ 
      error: '뉴스를 가져올 수 없습니다.',
      news: [],
      lastUpdate: new Date().toISOString()
    }, 500)
  }
})

// API 라우트: AI 코인 전망 분석 (다국어 지원)
app.get('/api/ai-forecast', async (c) => {
  try {
    const now = Date.now()
    
    // 언어 파라미터 가져오기 (기본값: ko)
    const lang = c.req.query('lang') || 'ko'
    
    // 언어별 캐시 키
    const cacheKey = `forecast_${lang}`
    
    // 캐시 체크 (언어별로 분리)
    if (aiForecastCache.data && aiForecastCache.data[cacheKey] && (now - aiForecastCache.timestamp) < aiForecastCache.ttl) {
      console.log(`Returning cached AI forecast for ${lang}`)
      return c.json(aiForecastCache.data[cacheKey])
    }
    
    console.log(`Generating new AI forecast for ${lang}...`)
    
    // 주요 코인 8개
    const coins = ['bitcoin', 'ethereum', 'ripple', 'solana', 'cardano', 'dogecoin', 'polkadot', 'avalanche-2']
    const coinSymbols: Record<string, string> = { 
      bitcoin: 'BTC', 
      ethereum: 'ETH', 
      ripple: 'XRP', 
      solana: 'SOL', 
      cardano: 'ADA',
      dogecoin: 'DOGE',
      polkadot: 'DOT',
      'avalanche-2': 'AVAX'
    }
    const coinNames: Record<string, string> = { 
      bitcoin: 'Bitcoin', 
      ethereum: 'Ethereum', 
      ripple: 'Ripple', 
      solana: 'Solana', 
      cardano: 'Cardano',
      dogecoin: 'Dogecoin',
      polkadot: 'Polkadot',
      'avalanche-2': 'Avalanche'
    }
    
    // 1. 가격 데이터 가져오기
    const pricesResponse = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-pro-api-key': COINGECKO_API_KEY
        }
      }
    )
    
    if (!pricesResponse.ok) {
      throw new Error('가격 데이터 조회 실패')
    }
    
    const prices = await pricesResponse.json()
    
    // 2. 최신 뉴스 가져오기 (캐시에서)
    let newsContext = '최근 암호화폐 뉴스 없음'
    if (newsCache.data && newsCache.data.news) {
      const recentNews = newsCache.data.news.slice(0, 3)
      newsContext = recentNews.map((n: any) => `- ${n.title}: ${n.description.substring(0, 150)}...`).join('\n')
    }
    
    // 언어별 프롬프트 설정
    const languagePrompts: Record<string, any> = {
      ko: {
        systemRole: '당신은 경력 10년 이상의 전문 암호화폐 애널리스트입니다. 데이터 기반의 상세하고 정확한 분석을 제공하며, reasoning은 반드시 100자 이상이어야 합니다. 항상 JSON 형식으로만 응답하며, 구체적인 수치와 근거를 반드시 포함합니다. 모든 응답은 한국어로 작성합니다.',
        intro: '당신은 경력 10년 이상의 전문 암호화폐 애널리스트입니다. 다음 시장 데이터를 바탕으로',
        outlookLabels: { bullish: '상승', bearish: '하락', neutral: '중립' },
        sections: {
          currentData: '현재 시장 데이터',
          recentNews: '최근 암호화폐 뉴스',
          requiredAnalysis: '필수 분석 사항 (반드시 모두 포함)',
          outlookCriteria: '전망 결정 기준',
          reasoning: '근거 설명 (필수 2-3문장, 100자 이상)',
          confidence: '신뢰도 (1-100)',
          advice: '투자 조언 (필수 1-2문장)'
        }
      },
      en: {
        systemRole: 'You are a professional cryptocurrency analyst with over 10 years of experience. Provide detailed and accurate data-driven analysis, with reasoning of at least 100 characters. Always respond in JSON format only, and must include specific numbers and evidence. All responses must be in English.',
        intro: 'You are a professional cryptocurrency analyst with over 10 years of experience. Based on the following market data, analyze',
        outlookLabels: { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' },
        sections: {
          currentData: 'Current Market Data',
          recentNews: 'Recent Crypto News',
          requiredAnalysis: 'Required Analysis (must include all)',
          outlookCriteria: 'Outlook Decision Criteria',
          reasoning: 'Reasoning (required 2-3 sentences, at least 100 characters)',
          confidence: 'Confidence (1-100)',
          advice: 'Investment Advice (required 1-2 sentences)'
        }
      },
      fr: {
        systemRole: 'Vous êtes un analyste professionnel de cryptomonnaies avec plus de 10 ans d\'expérience. Fournissez une analyse détaillée et précise basée sur les données, avec un raisonnement d\'au moins 100 caractères. Répondez toujours uniquement au format JSON et devez inclure des chiffres et des preuves spécifiques. Toutes les réponses doivent être en français.',
        intro: 'Vous êtes un analyste professionnel de cryptomonnaies avec plus de 10 ans d\'expérience. Sur la base des données de marché suivantes, analysez',
        outlookLabels: { bullish: 'Haussier', bearish: 'Baissier', neutral: 'Neutre' },
        sections: {
          currentData: 'Données du marché actuel',
          recentNews: 'Actualités crypto récentes',
          requiredAnalysis: 'Analyse requise (doit tout inclure)',
          outlookCriteria: 'Critères de décision de perspective',
          reasoning: 'Raisonnement (requis 2-3 phrases, au moins 100 caractères)',
          confidence: 'Confiance (1-100)',
          advice: 'Conseils d\'investissement (requis 1-2 phrases)'
        }
      },
      de: {
        systemRole: 'Sie sind ein professioneller Kryptowährungs-Analyst mit über 10 Jahren Erfahrung. Bieten Sie detaillierte und genaue datenbasierte Analysen mit einer Begründung von mindestens 100 Zeichen. Antworten Sie immer nur im JSON-Format und müssen spezifische Zahlen und Beweise enthalten. Alle Antworten müssen auf Deutsch sein.',
        intro: 'Sie sind ein professioneller Kryptowährungs-Analyst mit über 10 Jahren Erfahrung. Analysieren Sie basierend auf den folgenden Marktdaten',
        outlookLabels: { bullish: 'Bullisch', bearish: 'Bärisch', neutral: 'Neutral' },
        sections: {
          currentData: 'Aktuelle Marktdaten',
          recentNews: 'Aktuelle Krypto-Nachrichten',
          requiredAnalysis: 'Erforderliche Analyse (muss alles enthalten)',
          outlookCriteria: 'Ausblick-Entscheidungskriterien',
          reasoning: 'Begründung (erforderlich 2-3 Sätze, mindestens 100 Zeichen)',
          confidence: 'Vertrauen (1-100)',
          advice: 'Investitionsberatung (erforderlich 1-2 Sätze)'
        }
      },
      es: {
        systemRole: 'Eres un analista profesional de criptomonedas con más de 10 años de experiencia. Proporciona análisis detallados y precisos basados en datos, con razonamiento de al menos 100 caracteres. Siempre responde solo en formato JSON y debe incluir números y evidencia específicos. Todas las respuestas deben estar en español.',
        intro: 'Eres un analista profesional de criptomonedas con más de 10 años de experiencia. Basándote en los siguientes datos del mercado, analiza',
        outlookLabels: { bullish: 'Alcista', bearish: 'Bajista', neutral: 'Neutral' },
        sections: {
          currentData: 'Datos del mercado actual',
          recentNews: 'Noticias cripto recientes',
          requiredAnalysis: 'Análisis requerido (debe incluir todo)',
          outlookCriteria: 'Criterios de decisión de perspectiva',
          reasoning: 'Razonamiento (requerido 2-3 frases, al menos 100 caracteres)',
          confidence: 'Confianza (1-100)',
          advice: 'Consejo de inversión (requerido 1-2 frases)'
        }
      }
    }
    
    const langConfig = languagePrompts[lang] || languagePrompts['ko']
    
    // 3. OpenAI API로 AI 분석 요청
    const analysisPromises = coins.map(async (coinId) => {
      const coinData = prices[coinId]
      const symbol = coinSymbols[coinId]
      const change24h = coinData.usd_24h_change || 0
      
      // AI 프롬프트 생성 (언어별로 다르게)
      const prompt = `${langConfig.intro} ${symbol} (${coinId})의 단기 전망(1주일)을 **반드시 데이터 기반으로 상세히** 분석해주세요.

**현재 시장 데이터:**
- 코인: ${symbol} (${coinId})
- 현재 가격: $${coinData.usd.toLocaleString()}
- 24시간 변동률: ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%
- 시가총액: $${(coinData.usd_market_cap / 1e9).toFixed(2)}B
- 변동 분석: ${change24h > 5 ? '강한 상승세 (매우 긍정적)' : change24h > 2 ? '약한 상승세 (긍정적)' : change24h > -2 ? '보합세 (중립)' : change24h > -5 ? '약한 하락세 (부정적)' : '강한 하락세 (매우 부정적)'}
- 규모: ${(coinData.usd_market_cap / 1e9) > 100 ? '대형주 - 안정적, 기관 투자자 선호' : (coinData.usd_market_cap / 1e9) > 10 ? '중형주 - 성장 가능성과 리스크 공존' : '소형주 - 높은 변동성, 고위험 고수익'}

**${langConfig.sections.currentData}:**
- ${lang === 'ko' ? '코인' : lang === 'en' ? 'Coin' : lang === 'fr' ? 'Pièce' : lang === 'de' ? 'Münze' : 'Moneda'}: ${symbol} (${coinId})
- ${lang === 'ko' ? '현재 가격' : lang === 'en' ? 'Current Price' : lang === 'fr' ? 'Prix actuel' : lang === 'de' ? 'Aktueller Preis' : 'Precio actual'}: $${coinData.usd.toLocaleString()}
- ${lang === 'ko' ? '24시간 변동률' : lang === 'en' ? '24h Change' : lang === 'fr' ? 'Changement 24h' : lang === 'de' ? '24h Änderung' : 'Cambio 24h'}: ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%
- ${lang === 'ko' ? '시가총액' : lang === 'en' ? 'Market Cap' : lang === 'fr' ? 'Capitalisation' : lang === 'de' ? 'Marktkapitalisierung' : 'Capitalización'}: $${(coinData.usd_market_cap / 1e9).toFixed(2)}B

**${langConfig.sections.recentNews}:**
${newsContext}

**${langConfig.sections.requiredAnalysis}:**

1. **${langConfig.sections.outlookCriteria}**:
   ${lang === 'ko' 
     ? `- 24시간 변동률이 ${change24h > 0 ? '플러스' : '마이너스'}이므로 ${change24h > 2 ? '상승 모멘텀' : change24h < -2 ? '하락 모멘텀' : '횡보'}입니다` 
     : lang === 'en'
     ? `- 24h change is ${change24h > 0 ? 'positive' : 'negative'}, showing ${change24h > 2 ? 'upward momentum' : change24h < -2 ? 'downward momentum' : 'sideways movement'}`
     : lang === 'fr'
     ? `- Le changement 24h est ${change24h > 0 ? 'positif' : 'négatif'}, montrant ${change24h > 2 ? 'une dynamique haussière' : change24h < -2 ? 'une dynamique baissière' : 'un mouvement latéral'}`
     : lang === 'de'
     ? `- Die 24h-Änderung ist ${change24h > 0 ? 'positiv' : 'negativ'} und zeigt ${change24h > 2 ? 'Aufwärtsmomentum' : change24h < -2 ? 'Abwärtsmomentum' : 'Seitwärtsbewegung'}`
     : `- El cambio 24h es ${change24h > 0 ? 'positivo' : 'negativo'}, mostrando ${change24h > 2 ? 'impulso alcista' : change24h < -2 ? 'impulso bajista' : 'movimiento lateral'}`}

2. **${langConfig.sections.reasoning}**:
   ${lang === 'ko'
     ? '- 반드시 구체적 수치를 인용하세요 (예: "24시간 변동률 +2.5%", "시가총액 $173B")'
     : lang === 'en'
     ? '- Must cite specific numbers (e.g., "24h change +2.5%", "market cap $173B")'
     : lang === 'fr'
     ? '- Doit citer des chiffres spécifiques (par exemple, "changement 24h +2,5%", "capitalisation $173B")'
     : lang === 'de'
     ? '- Muss spezifische Zahlen zitieren (z.B. "24h-Änderung +2,5%", "Marktkapitalisierung $173B")'
     : '- Debe citar números específicos (por ejemplo, "cambio 24h +2,5%", "capitalización $173B")'}

3. **${langConfig.sections.confidence}**:
   ${lang === 'ko'
     ? '- 강한 추세 (변동률 > 5% 또는 < -5%) → 70-90%\n   - 중간 추세 (변동률 2-5% 또는 -2~-5%) → 60-80%\n   - 보합 (변동률 -2~2%) → 50-70%'
     : lang === 'en'
     ? '- Strong trend (change > 5% or < -5%) → 70-90%\n   - Medium trend (change 2-5% or -2~-5%) → 60-80%\n   - Sideways (change -2~2%) → 50-70%'
     : lang === 'fr'
     ? '- Tendance forte (changement > 5% ou < -5%) → 70-90%\n   - Tendance moyenne (changement 2-5% ou -2~-5%) → 60-80%\n   - Latéral (changement -2~2%) → 50-70%'
     : lang === 'de'
     ? '- Starker Trend (Änderung > 5% oder < -5%) → 70-90%\n   - Mittlerer Trend (Änderung 2-5% oder -2~-5%) → 60-80%\n   - Seitwärts (Änderung -2~2%) → 50-70%'
     : '- Tendencia fuerte (cambio > 5% o < -5%) → 70-90%\n   - Tendencia media (cambio 2-5% o -2~-5%) → 60-80%\n   - Lateral (cambio -2~2%) → 50-70%'}

4. **${langConfig.sections.advice}**:
   ${lang === 'ko'
     ? '- 구체적인 가격대나 전략을 제시하세요'
     : lang === 'en'
     ? '- Provide specific price levels or strategies'
     : lang === 'fr'
     ? '- Fournir des niveaux de prix spécifiques ou des stratégies'
     : lang === 'de'
     ? '- Geben Sie spezifische Preisniveaus oder Strategien an'
     : '- Proporcione niveles de precios específicos o estrategias'}

${lang === 'ko' ? '**중요**: reasoning은 반드시 100자 이상이어야 하며, 구체적인 수치와 근거를 포함해야 합니다.' : ''}

${lang === 'ko' ? 'JSON 형식으로만 응답해주세요' : lang === 'en' ? 'Respond in JSON format only' : lang === 'fr' ? 'Répondez uniquement au format JSON' : lang === 'de' ? 'Antworten Sie nur im JSON-Format' : 'Responda solo en formato JSON'}:
{
  "outlook": "${langConfig.outlookLabels.bullish}" | "${langConfig.outlookLabels.bearish}" | "${langConfig.outlookLabels.neutral}",
  "confidence": ${lang === 'ko' ? '1-100 사이 숫자' : '1-100'},
  "reasoning": "${lang === 'ko' ? '반드시 100자 이상, 구체적 수치 포함, 변동률과 시가총액 언급 필수' : lang === 'en' ? 'at least 100 chars, include specific numbers, must mention change and market cap' : lang === 'fr' ? 'au moins 100 caractères, inclure des chiffres spécifiques' : lang === 'de' ? 'mindestens 100 Zeichen, spezifische Zahlen einbeziehen' : 'al menos 100 caracteres, incluir números específicos'}",
  "advice": "${lang === 'ko' ? '구체적인 투자 전략 1-2문장' : lang === 'en' ? 'specific investment strategy 1-2 sentences' : lang === 'fr' ? 'stratégie d\'investissement spécifique 1-2 phrases' : lang === 'de' ? 'spezifische Anlagestrategie 1-2 Sätze' : 'estrategia de inversión específica 1-2 frases'}"
}`

      try {
        // OpenAI API 호출 (환경 변수 사용)
        const apiKey = c.env.OPENAI_API_KEY
        
        if (!apiKey) {
          console.error('OpenAI API key not found in environment')
          throw new Error('API 키 없음')
        }
        
        // OpenAI 공식 API 사용 (gpt-5.2 - 최신 모델!)
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-5.2',
            messages: [
              { role: 'system', content: langConfig.systemRole },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_completion_tokens: 1000
          })
        })
        
        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text()
          console.error('OpenAI API error:', openaiResponse.status, errorText)
          throw new Error(`AI 분석 실패: ${openaiResponse.status}`)
        }
        
        const aiResult = await openaiResponse.json()
        const content = aiResult.choices[0].message.content
        
        // JSON 파싱
        let analysis
        try {
          // JSON 블록 추출 (```json ... ``` 제거)
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('JSON 형식 오류')
          }
        } catch (e) {
          // 파싱 실패 시 기본값
          console.error('JSON parsing failed for', coinId, e)
          analysis = {
            outlook: '중립',
            confidence: 50,
            reasoning: 'AI 분석이 일시적으로 제한되어 기본 전망을 제공합니다.',
            advice: '시장 상황을 지속적으로 모니터링하세요.'
          }
        }
        
        return {
          coinId,
          symbol,
          name: coinNames[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1),
          currentPrice: coinData.usd,
          change24h: change24h,
          analysis: analysis
        }
      } catch (error) {
        console.error(`AI analysis failed for ${coinId}:`, error)
        
        // 에러 시 시장 데이터 기반 간단한 분석 제공
        const change24h = coinData.usd_24h_change || 0
        let simpleOutlook = '중립'
        let simpleReasoning = `현재 ${symbol}의 24시간 변동률은 ${change24h.toFixed(2)}%입니다.`
        
        if (change24h > 5) {
          simpleOutlook = '상승'
          simpleReasoning += ' 강한 상승세를 보이고 있어 단기적으로 긍정적인 전망이 예상됩니다.'
        } else if (change24h < -5) {
          simpleOutlook = '하락'
          simpleReasoning += ' 하락세를 보이고 있어 단기적으로 조정이 필요할 수 있습니다.'
        } else {
          simpleReasoning += ' 안정적인 범위에서 거래되고 있습니다.'
        }
        
        return {
          coinId,
          symbol,
          name: coinNames[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1),
          currentPrice: coinData.usd,
          change24h: change24h,
          analysis: {
            outlook: simpleOutlook,
            confidence: 50,
            reasoning: simpleReasoning,
            advice: '시장 변동성이 높으니 신중하게 투자하세요.'
          }
        }
      }
    })
    
    const forecasts = await Promise.all(analysisPromises)
    
    const result = {
      forecasts,
      lastUpdate: new Date().toISOString()
    }
    
    // 캐시 업데이트 (언어별로 분리)
    if (!aiForecastCache.data) {
      aiForecastCache.data = {}
    }
    aiForecastCache.data[cacheKey] = result
    aiForecastCache.timestamp = now
    
    return c.json(result)
  } catch (error) {
    console.error('AI Forecast API error:', error)
    
    // 에러 시 캐시된 데이터 반환
    if (aiForecastCache.data) {
      console.log('Returning stale cached AI forecast due to error')
      return c.json(aiForecastCache.data)
    }
    
    return c.json({ 
      error: 'AI 전망을 가져올 수 없습니다.',
      forecasts: [],
      lastUpdate: new Date().toISOString()
    }, 500)
  }
})

// 메인 페이지
app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div class="container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-main">
            <div class="header-icon">💰</div>
            <h1 id="pageTitle">암호화폐 실시간 대시보드</h1>
          </div>
          
          {/* 언어 선택 */}
          <div class="language-selector">
            <button onclick="changeLanguage('ko')" class="lang-btn" data-lang="ko" title="한국어">
              <span class="fi fi-kr"></span>
            </button>
            <button onclick="changeLanguage('en')" class="lang-btn" data-lang="en" title="English">
              <span class="fi fi-us"></span>
            </button>
            <button onclick="changeLanguage('fr')" class="lang-btn" data-lang="fr" title="Français">
              <span class="fi fi-fr"></span>
            </button>
            <button onclick="changeLanguage('de')" class="lang-btn" data-lang="de" title="Deutsch">
              <span class="fi fi-de"></span>
            </button>
            <button onclick="changeLanguage('es')" class="lang-btn" data-lang="es" title="Español">
              <span class="fi fi-es"></span>
            </button>
          </div>
        </div>
      </header>
      
      {/* 빠른 네비게이션 바 */}
      <nav style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
        padding: '1rem 0',
        position: 'sticky',
        top: '0',
        zIndex: '999',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0 1rem'
        }}>
          <button 
            onclick="document.getElementById('app').scrollIntoView({ behavior: 'smooth', block: 'start' })"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'rgba(102, 126, 234, 0.2)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onmouseover="this.style.background='rgba(102, 126, 234, 0.3)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(102, 126, 234, 0.2)'; this.style.transform='translateY(0)'"
          >
            <i class="fas fa-coins" style={{fontSize: '1.1rem'}}></i>
            <span id="navCoins">코인 목록</span>
          </button>
          
          <button 
            onclick="const aiBtn = document.getElementById('loadAIForecastBtn'); if (aiBtn) { aiBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => aiBtn.classList.add('pulse-animation'), 500); setTimeout(() => aiBtn.classList.remove('pulse-animation'), 2500); }"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.transform='translateY(0)'"
          >
            <i class="fas fa-brain" style={{fontSize: '1.1rem'}}></i>
            <span id="navAI">AI 전망</span>
          </button>
          
          <button 
            onclick="loadCryptoNews(); setTimeout(() => { const newsCard = document.querySelector('.news-feed-card'); if (newsCard) newsCard.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onmouseover="this.style.background='rgba(34, 197, 94, 0.3)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(34, 197, 94, 0.2)'; this.style.transform='translateY(0)'"
          >
            <i class="fas fa-newspaper" style={{fontSize: '1.1rem'}}></i>
            <span id="navNews">최신 뉴스</span>
          </button>
          
          <button 
            onclick="setTimeout(() => { const portfolioCards = document.querySelectorAll('.coin-card'); if (portfolioCards.length > 0) portfolioCards[0].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'rgba(251, 146, 60, 0.2)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onmouseover="this.style.background='rgba(251, 146, 60, 0.3)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(251, 146, 60, 0.2)'; this.style.transform='translateY(0)'"
          >
            <i class="fas fa-briefcase" style={{fontSize: '1.1rem'}}></i>
            <span id="navPortfolio">포트폴리오</span>
          </button>
        </div>
      </nav>
      
      {/* 광고 영역 1: 헤더 아래 배너 (상단) */}
      <div class="ad-container ad-header">
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998'}}>
          <iframe 
            data-aa='2421971' 
            src='//acceptable.a-ads.com/2421971/?size=Adaptive'
            style={{
              border: '0',
              padding: '0',
              width: '70%',
              height: 'auto',
              overflow: 'hidden',
              display: 'block',
              margin: 'auto'
            }}
          />
        </div>
      </div>
      
      <div id="app">
        <div class="loading">데이터 로딩 중...</div>
      </div>
      
      {/* 코인 브라우저 모달 */}
      <div id="coinBrowserModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="coinBrowserModalTitle">Top 100 암호화폐</h2>
            <button class="modal-close" onclick="closeCoinBrowser()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div id="coinBrowserContent"></div>
        </div>
      </div>
      
      {/* 차트 모달 */}
      <div id="chartModal" class="modal">
        <div class="modal-content chart-modal">
          <div class="modal-header">
            <h2 id="chartModalTitle">가격 차트</h2>
            <button class="modal-close" onclick="closeChartModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="chart-period-selector">
            <button class="chart-period-btn active" data-days="7" onclick="loadChart(currentChartCoinId, 7)" id="chartBtn7">7일</button>
            <button class="chart-period-btn" data-days="30" onclick="loadChart(currentChartCoinId, 30)" id="chartBtn30">30일</button>
            <button class="chart-period-btn" data-days="90" onclick="loadChart(currentChartCoinId, 90)" id="chartBtn90">90일</button>
          </div>
          <div class="chart-container">
            <div id="chartLoading" class="chart-loading">
              <i class="fas fa-spinner fa-spin"></i> <span id="chartLoadingText">차트 로딩 중...</span>
            </div>
            <canvas id="priceChart"></canvas>
          </div>
        </div>
      </div>
      
      {/* 뉴스 모달 */}
      <div id="newsModal" class="modal">
        <div class="modal-content news-modal">
          <div class="modal-header">
            <h2 id="newsModalTitle">뉴스</h2>
            <button class="modal-close" onclick="closeNewsModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="news-modal-body">
            <div class="news-modal-meta">
              <span class="news-modal-source" id="newsModalSource"></span>
              <span class="news-modal-time" id="newsModalTime"></span>
            </div>
            <h3 class="news-modal-article-title" id="newsModalArticleTitle"></h3>
            <div class="news-modal-description" id="newsModalDescription"></div>
            <button class="news-read-more-btn" id="newsReadMoreBtn" onclick="toggleNewsDescription()" style="display: none;">
              <i class="fas fa-chevron-down"></i> <span id="newsReadMoreBtnText">더 보기</span>
            </button>
            <div class="news-modal-actions">
              <button class="btn-primary" id="newsModalTranslateBtn" onclick="translateModalNews()">
                <i class="fas fa-language"></i> <span id="newsModalTranslateBtnText">번역</span>
              </button>
              <a class="btn-secondary" id="newsModalLink" href="#" target="_blank" rel="noopener noreferrer">
                <i class="fas fa-external-link-alt"></i> <span id="newsModalLinkText">원문 보기</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* 포트폴리오 모달 */}
      <div id="portfolioModal" class="modal">
        <div class="modal-content portfolio-modal">
          <div class="modal-header">
            <h2 id="portfolioModalTitle">포트폴리오 관리</h2>
            <button class="modal-close" onclick="closePortfolioModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="portfolio-form">
            <input type="hidden" id="portfolioCoinId" />
            
            <div class="form-group">
              <label for="portfolioAmount" id="portfolioAmountLabel">
                <i class="fas fa-coins"></i> 보유 수량
              </label>
              <input 
                type="number" 
                id="portfolioAmount" 
                placeholder="0.0000" 
                step="0.0001"
                oninput="onPortfolioInputChange()"
              />
            </div>
            
            <div class="form-group">
              <label for="portfolioAvgPrice" id="portfolioAvgPriceLabel">
                <i class="fas fa-dollar-sign"></i> 평균 매수가 (USD)
              </label>
              <input 
                type="number" 
                id="portfolioAvgPrice" 
                placeholder="0.00" 
                step="0.01"
                oninput="onPortfolioInputChange()"
              />
            </div>
            
            <div class="form-group">
              <label id="portfolioCurrentPriceLabel">
                <i class="fas fa-chart-line"></i> 현재가 (USD)
              </label>
              <div class="current-price-display" id="currentPrice">-</div>
            </div>
            
            <div class="profit-calculation" id="profitCalculation">
              <p class="text-gray-400" id="portfolioPlaceholder">수량과 평균 매수가를 입력하세요.</p>
            </div>
            
            <div class="form-actions">
              <button class="btn-save" onclick="savePortfolioData()" id="portfolioSaveBtn">
                <i class="fas fa-save"></i> 저장
              </button>
              <button class="btn-cancel" onclick="closePortfolioModal()" id="portfolioCancelBtn">
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 사용설명서 위젯 버튼 (우측 하단 고정) */}
      <button 
        onclick="openUserGuide()" 
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(102, 126, 234, 0.1)',
          cursor: 'pointer',
          fontSize: '28px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: '999',
          animation: 'pulse 2s infinite'
        }}
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 30px rgba(102, 126, 234, 0.6), 0 0 0 6px rgba(102, 126, 234, 0.2)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(102, 126, 234, 0.1)';"
        title="사용 설명서"
      >
        <i class="fas fa-question"></i>
      </button>
      
      {/* 사용설명서 모달 */}
      <div 
        id="userGuideModal" 
        class="modal" 
        style={{display: 'none', zIndex: '10000'}}
      >
        <div 
          class="modal-content" 
          style={{
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 모달 헤더 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '1.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700'
            }}>
              <i class="fas fa-book-open" style={{marginRight: '0.75rem', color: '#667eea'}}></i>
              <span id="userGuideTitle">사용 설명서</span>
            </h2>
            <button 
              onclick="closeUserGuide()" 
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                color: '#ef4444',
                fontSize: '1.5rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='rotate(90deg)';"
              onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='rotate(0deg)';"
            >
              ×
            </button>
          </div>
          
          {/* 모달 바디 (스크롤 가능) */}
          <div 
            id="userGuideContent"
            style={{
              overflowY: 'auto',
              flex: '1',
              paddingRight: '1rem'
            }}
          >
            {/* 한국어 가이드 */}
            <div class="guide-lang guide-ko">
              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  🚀 빠른 시작
                </h3>
                <ol style={{lineHeight: '1.8', paddingLeft: '1.5rem'}}>
                  <li><strong>코인 검색</strong>: 상단 검색창에서 원하는 코인 검색 (10,000+ 코인)</li>
                  <li><strong>Top 100 브라우저</strong>: `Top 100 🏆` 버튼으로 시가총액 상위 코인 탐색</li>
                  <li><strong>코인 추가</strong>: 검색 결과 또는 Top 100에서 클릭하여 추가</li>
                  <li><strong>정렬 기능</strong>: 가격순, 변동률순, 김프순 등 7가지 정렬 옵션</li>
                  <li><strong>즐겨찾기</strong>: ⭐ 별 아이콘 클릭으로 즐겨찾기 추가</li>
                  <li><strong>포트폴리오</strong>: 코인 카드의 `포트폴리오` 버튼으로 수익률 추적</li>
                  <li><strong>차트 보기</strong>: `차트` 버튼으로 7/30/90일 가격 추이 확인</li>
                  <li><strong>AI 전망 분석</strong>: 🤖 AI 버튼 클릭하면 주요 코인 1주일 단기 전망 + 신뢰도 + 투자 조언 표시</li>
                  <li><strong>뉴스 읽기</strong>: 하단 뉴스 섹션에서 최신 암호화폐 뉴스 + 한글 번역</li>
                </ol>
              </section>
              
              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  💡 고급 팁
                </h3>
                <ul style={{lineHeight: '1.8', paddingLeft: '1.5rem'}}>
                  <li><strong>AI 전망 활용</strong>: 🤖 AI 버튼 클릭 → 상승/하락/중립 전망 + 신뢰도(%) + 근거 + 투자 조언 (참고용, 투자 책임은 본인)</li>
                  <li><strong>더보기 버튼</strong>: AI 전망 분석이 길 경우 `더보기` 버튼으로 전체 내용 확인</li>
                  <li><strong>김치 프리미엄 활용</strong>: 한국어로 변경하면 업비트/빗썸/코인원 가격 비교 가능</li>
                  <li><strong>공포탐욕지수</strong>: 상단 통계에서 시장 심리 확인하여 투자 타이밍 판단</li>
                  <li><strong>수익률 정렬</strong>: `수익률순` 정렬로 가장 수익 높은 코인 확인</li>
                  <li><strong>자동 새로고침</strong>: 30초마다 자동 업데이트, 수동 새로고침도 가능</li>
                  <li><strong>다국어 지원</strong>: 5개 언어 지원 (한국어/영어/프랑스어/독일어/스페인어)</li>
                </ul>
              </section>
              
              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  🆘 문제 해결
                </h3>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#ef4444'}}>
                    ❌ 가격이 로딩되지 않아요
                  </p>
                  <p style={{margin: '0', color: '#cbd5e1'}}>
                    → 30초 후 자동 재시도 또는 `새로고침` 버튼 클릭
                  </p>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#ef4444'}}>
                    ❌ 김치 프리미엄이 안 보여요
                  </p>
                  <p style={{margin: '0', color: '#cbd5e1'}}>
                    → 우측 상단에서 🇰🇷 한국어로 변경 (주요 20개 코인만 지원)
                  </p>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#ef4444'}}>
                    ❌ 포트폴리오가 저장 안 돼요
                  </p>
                  <p style={{margin: '0', color: '#cbd5e1'}}>
                    → 브라우저 설정에서 쿠키 및 사이트 데이터 허용 (시크릿 모드 지원 안 됨)
                  </p>
                </div>
              </section>
              
              <section>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  📞 문의
                </h3>
                <p style={{lineHeight: '1.8', color: '#cbd5e1'}}>
                  궁금한 점이나 문제가 있으시면 언제든지 연락주세요:
                </p>
                <div style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  marginTop: '1rem'
                }}>
                  <i class="fas fa-envelope" style={{fontSize: '2rem', color: '#667eea', marginBottom: '0.5rem'}}></i>
                  <p style={{margin: '0', fontSize: '1.1rem', color: '#cbd5e1'}}>
                    <a 
                      href="mailto:crypto.darugi@gmail.com" 
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      crypto.darugi@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
            
            {/* 영어 가이드 */}
            <div class="guide-lang guide-en" style={{display: 'none'}}>
              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  🚀 Quick Start
                </h3>
                <ol style={{lineHeight: '1.8', paddingLeft: '1.5rem'}}>
                  <li><strong>Search Coins</strong>: Use search bar to find 10,000+ cryptocurrencies</li>
                  <li><strong>Top 100 Browser</strong>: Click `Top 100 🏆` button to browse top coins</li>
                  <li><strong>Add Coins</strong>: Click on search results or Top 100 to add</li>
                  <li><strong>Sort Options</strong>: 7 sorting options (price, change%, market cap, etc.)</li>
                  <li><strong>Favorites</strong>: Click ⭐ star icon to add to favorites</li>
                  <li><strong>Portfolio</strong>: Track profits with `Portfolio` button on coin cards</li>
                  <li><strong>Charts</strong>: View 7/30/90-day price trends with `Chart` button</li>
                  <li><strong>AI Forecast</strong>: 🤖 Click AI button to see 1-week forecast + confidence + reasoning + advice</li>
                  <li><strong>News</strong>: Read latest crypto news with translation in news section</li>
                </ol>
              </section>
              
              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  💡 Pro Tips
                </h3>
                <ul style={{lineHeight: '1.8', paddingLeft: '1.5rem'}}>
                  <li><strong>AI Forecast Tips</strong>: Click 🤖 AI button → Bullish/Bearish/Neutral outlook + confidence(%) + reasoning + advice (for reference only)</li>
                  <li><strong>Read More Button</strong>: Click `Read more` button if AI analysis is long to see full content</li>
                  <li><strong>Fear & Greed Index</strong>: Check market sentiment for timing</li>
                  <li><strong>Profit Sorting</strong>: Sort by profit to see best performers</li>
                  <li><strong>Auto Refresh</strong>: Prices update every 30 seconds automatically</li>
                  <li><strong>Multi-language</strong>: 5 languages supported</li>
                  <li><strong>Coinbase Prices</strong>: Switch to English for US exchange prices</li>
                </ul>
              </section>
              
              <section>
                <h3 style={{
                  color: '#667eea',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea',
                  paddingLeft: '1rem'
                }}>
                  📞 Contact
                </h3>
                <div style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <i class="fas fa-envelope" style={{fontSize: '2rem', color: '#667eea', marginBottom: '0.5rem'}}></i>
                  <p style={{margin: '0', fontSize: '1.1rem', color: '#cbd5e1'}}>
                    <a 
                      href="mailto:crypto.darugi@gmail.com" 
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      crypto.darugi@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      {/* 광고 영역 3: 하단 배너 */}
      <div class="ad-container ad-footer" style={{marginTop: '3rem', marginBottom: '2rem'}}>
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998'}}>
          <iframe 
            data-aa='2421980' 
            src='//acceptable.a-ads.com/2421980/?size=Adaptive'
            style={{
              border: '0',
              padding: '0',
              width: '70%',
              height: 'auto',
              overflow: 'hidden',
              display: 'block',
              margin: 'auto'
            }}
          />
        </div>
      </div>
      
      {/* 푸터 */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        marginTop: '3rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#94a3b8',
        fontSize: '0.9rem'
      }}>
        <div style={{marginBottom: '1rem'}}>
          <i class="fas fa-envelope" style={{marginRight: '0.5rem', color: '#667eea'}}></i>
          <span id="contactLabel">문의</span>: 
          <a href="mailto:crypto.darugi@gmail.com" style={{
            color: '#3b82f6',
            textDecoration: 'none',
            marginLeft: '0.5rem',
            fontWeight: '600'
          }}>
            crypto.darugi@gmail.com
          </a>
        </div>
        <div style={{fontSize: '0.85rem', color: '#64748b'}}>
          © 2024 Crypto Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  )
})

// 🌍 국가별 거래소 가격 API
// 각 언어별로 해당 국가의 주요 거래소 가격 표시
app.get('/api/exchange-prices/:coinSymbol', async (c) => {
  try {
    const coinSymbol = c.req.param('coinSymbol').toUpperCase()
    const country = c.req.query('country') || 'kr' // kr, us, fr, de, es
    
    let exchangePrice = null
    let exchangeName = ''
    let currency = 'USD'
    
    switch (country) {
      case 'kr':
        // 한국: 업비트 (이미 김치 프리미엄에서 사용 중)
        try {
          const upbitResponse = await fetch(`https://api.upbit.com/v1/ticker?markets=KRW-${coinSymbol}`)
          const upbitData = await upbitResponse.json()
          if (upbitData.length > 0 && !upbitData[0].error) {
            exchangePrice = upbitData[0].trade_price
            exchangeName = 'Upbit'
            currency = 'KRW'
          }
        } catch (error) {
          console.error('Upbit API error:', error)
        }
        break
        
      case 'us':
        // 미국: Coinbase Pro
        try {
          const coinbaseResponse = await fetch(`https://api.coinbase.com/v2/prices/${coinSymbol}-USD/spot`)
          const coinbaseData = await coinbaseResponse.json()
          if (coinbaseData.data) {
            exchangePrice = parseFloat(coinbaseData.data.amount)
            exchangeName = 'Coinbase'
            currency = 'USD'
          }
        } catch (error) {
          console.error('Coinbase API error:', error)
        }
        break
        
      case 'fr':
        // 프랑스: Bitstamp (유럽 최대 거래소)
        try {
          const bitstampResponse = await fetch(`https://www.bitstamp.net/api/v2/ticker/${coinSymbol.toLowerCase()}eur/`)
          const bitstampData = await bitstampResponse.json()
          if (bitstampData.last) {
            exchangePrice = parseFloat(bitstampData.last)
            exchangeName = 'Bitstamp'
            currency = 'EUR'
          }
        } catch (error) {
          console.error('Bitstamp API error:', error)
        }
        break
        
      case 'de':
        // 독일: Kraken
        try {
          const krakenResponse = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${coinSymbol}EUR`)
          const krakenData = await krakenResponse.json()
          if (krakenData.result) {
            const pairKey = Object.keys(krakenData.result)[0]
            if (pairKey) {
              exchangePrice = parseFloat(krakenData.result[pairKey].c[0])
              exchangeName = 'Kraken'
              currency = 'EUR'
            }
          }
        } catch (error) {
          console.error('Kraken API error:', error)
        }
        break
        
      case 'es':
        // 스페인: Binance (글로벌 거래소, 스페인어 지원)
        try {
          const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol}EUR`)
          const binanceData = await binanceResponse.json()
          if (binanceData.price) {
            exchangePrice = parseFloat(binanceData.price)
            exchangeName = 'Binance'
            currency = 'EUR'
          }
        } catch (error) {
          console.error('Binance API error:', error)
        }
        break
    }
    
    if (exchangePrice) {
      return c.json({
        coinSymbol,
        exchangeName,
        price: exchangePrice,
        currency,
        country
      })
    } else {
      return c.json({ 
        error: '거래소 가격을 가져올 수 없습니다.',
        coinSymbol,
        country
      }, 404)
    }
  } catch (error) {
    console.error('Exchange price API error:', error)
    return c.json({ 
      error: '거래소 가격 조회 실패',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 🤖 트위터 봇 Cron 엔드포인트 (수동 트리거용)
app.get('/api/run-crypto-bot', async (c) => {
  try {
    // 환경 변수 확인
    if (!c.env.TWITTER_API_KEY || !c.env.OPENAI_API_KEY) {
      return c.json({ 
        error: '환경 변수가 설정되지 않았습니다.',
        required: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET', 'OPENAI_API_KEY']
      }, 500)
    }

    console.log('🤖 수동 트리거: 암호화폐 트윗 봇 실행 중...')
    
    const result = await runCryptoBot({
      TWITTER_API_KEY: c.env.TWITTER_API_KEY,
      TWITTER_API_SECRET: c.env.TWITTER_API_SECRET!,
      TWITTER_ACCESS_TOKEN: c.env.TWITTER_ACCESS_TOKEN!,
      TWITTER_ACCESS_SECRET: c.env.TWITTER_ACCESS_SECRET!,
      OPENAI_API_KEY: c.env.OPENAI_API_KEY,
    })

    return c.json({ 
      success: true, 
      message: '트윗 발행 완료',
      result 
    })
  } catch (error) {
    console.error('봇 실행 오류:', error)
    return c.json({ 
      error: '봇 실행 실패',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Cloudflare Cron Trigger (매일 자동 실행)
export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    console.log('⏰ Cron 트리거: 암호화폐 트윗 봇 자동 실행')
    console.log(`실행 시간: ${new Date(event.scheduledTime).toISOString()}`)
    
    try {
      // 환경 변수 확인
      if (!env.TWITTER_API_KEY || !env.OPENAI_API_KEY) {
        console.error('❌ 환경 변수가 설정되지 않았습니다.')
        return
      }

      ctx.waitUntil(
        runCryptoBot({
          TWITTER_API_KEY: env.TWITTER_API_KEY,
          TWITTER_API_SECRET: env.TWITTER_API_SECRET!,
          TWITTER_ACCESS_TOKEN: env.TWITTER_ACCESS_TOKEN!,
          TWITTER_ACCESS_SECRET: env.TWITTER_ACCESS_SECRET!,
          OPENAI_API_KEY: env.OPENAI_API_KEY,
        })
      )
      
      console.log('✅ Cron 작업 완료')
    } catch (error) {
      console.error('❌ Cron 작업 실패:', error)
    }
  }
}
