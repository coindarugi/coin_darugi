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
  COINGECKO_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 🔑 CoinGecko API (Pro/Basic API 사용)
const COINGECKO_API_URL = 'https://pro-api.coingecko.com/api/v3'

// 🤖 AI 전망 캐시 (5분 - 베이직 플랜)
const aiForecastCache = {
  data: null as any,
  timestamp: 0,
  ttl: 300000, // 5분 (베이직 플랜으로 더 자주 갱신)
  version: 6 // 버전 변경으로 캐시 무효화 (GPT-5.2 + OpenAI API)
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
    // 🔑 환경 변수에서 CoinGecko API 키 가져오기 (선택적)
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
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
    // CoinGecko Basic API 키 사용 (Pro API URL에서는 x-cg-pro-api-key 사용)
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
    }
    
    const apiUrl = `${COINGECKO_API_URL}/simple/price?ids=${allCoins}&vs_currencies=usd,krw&include_24hr_change=true&include_market_cap=true`
    console.log('📍 API URL:', apiUrl)
    console.log('📍 Headers:', headers)
    
    const response = await fetch(apiUrl, { headers })
    
    if (!response.ok) {
      const errorBody = await response.text()
      console.error('❌ CoinGecko API error:', response.status, response.statusText)
      console.error('❌ Error body:', errorBody)
      
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
    // 🔑 환경 변수에서 CoinGecko API 키 가져오기
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
    const page = parseInt(c.req.query('page') || '1')
    const perPage = 100
    
    // 캐시 체크
    const now = Date.now()
    const cacheKey = `page_${page}`
    
    if (coinsListCache.data?.[cacheKey] && (now - coinsListCache.timestamp) < coinsListCache.ttl) {
      console.log('Returning cached coins list')
      return c.json(coinsListCache.data[cacheKey])
    }
    
    console.log('Fetching coins list from CoinGecko API...')
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
    
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
      { headers }
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
    // 🔑 환경 변수에서 CoinGecko API 키 가져오기
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
    const query = c.req.query('q') || ''
    
    if (query.length < 2) {
      return c.json({ coins: [] })
    }
    
    console.log('Searching coins:', query)
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
    
    const response = await fetch(
      `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`,
      { headers }
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
    // 🔑 환경 변수에서 CoinGecko API 키 가져오기
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
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
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
    
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { headers }
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
    // 🔑 환경 변수에서 CoinGecko API 키 가져오기
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
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
        const headers: Record<string, string> = { 'Accept': 'application/json' }
        if (COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
        
        const coingeckoResponse = await fetch(
          `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=krw`,
          { headers }
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
    // 🔑 환경 변수에서 API 키들 가져오기
    const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
    
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
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
    
    const pricesResponse = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { headers }
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
        // OpenAI API 사용 (GPT-5.2 - 2025년 12월 최신 모델)
        const apiKey = c.env.OPENAI_API_KEY
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY not configured')
        }
        
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
            max_completion_tokens: 700
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
        
        // 시장 데이터 기반 스마트 분석 제공
        const change24h = coinData.usd_24h_change || 0
        const marketCap = coinData.usd_market_cap || 0
        const marketCapB = (marketCap / 1e9).toFixed(1)
        
        let outlook = '중립'
        let confidence = 50
        let reasoning = ''
        let advice = ''
        
        // 변동률 기반 전망
        if (change24h > 10) {
          outlook = lang === 'ko' ? '상승' : lang === 'en' ? 'Bullish' : lang === 'fr' ? 'Haussier' : lang === 'de' ? 'Bullisch' : 'Alcista'
          confidence = 75
          reasoning = lang === 'ko' 
            ? `${symbol}이(가) 24시간 동안 ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%의 강한 상승세를 보이고 있습니다. 시가총액 $${marketCapB}B 규모에서 이러한 상승은 강한 매수 모멘텀을 나타냅니다. 거래량 증가와 함께 단기 상승 추세가 지속될 가능성이 있습니다.`
            : `${symbol} shows strong upward momentum with ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}% in 24h. Market cap of $${marketCapB}B suggests solid buying pressure. Short-term bullish trend likely to continue with increased trading volume.`
          advice = lang === 'ko'
            ? '강한 상승세이지만 과매수 구간에 진입했을 수 있습니다. 수익 실현 시점을 고려하고 손절매 라인을 설정하세요.'
            : 'Strong uptrend but may be overbought. Consider profit-taking levels and set stop-loss.'
        } else if (change24h > 5) {
          outlook = lang === 'ko' ? '상승' : lang === 'en' ? 'Bullish' : lang === 'fr' ? 'Haussier' : lang === 'de' ? 'Bullisch' : 'Alcista'
          confidence = 65
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%의 상승을 기록했습니다. 시가총액 $${marketCapB}B로 ${marketCapB > 100 ? '대형주' : marketCapB > 10 ? '중형주' : '소형주'} 규모입니다. 긍정적인 시장 심리를 반영하며 상승 모멘텀이 형성되고 있습니다.`
            : `${symbol} gained ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}% in 24h with market cap of $${marketCapB}B. Positive market sentiment forming bullish momentum.`
          advice = lang === 'ko'
            ? '상승 추세이나 변동성에 주의하세요. 분할 매수 전략을 고려하고 시장 상황을 지속적으로 모니터링하세요.'
            : 'Uptrend but watch for volatility. Consider dollar-cost averaging and monitor market conditions.'
        } else if (change24h > 2) {
          outlook = lang === 'ko' ? '중립' : lang === 'en' ? 'Neutral' : lang === 'fr' ? 'Neutre' : lang === 'de' ? 'Neutral' : 'Neutral'
          confidence = 55
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%의 소폭 상승을 보였습니다. 시가총액 $${marketCapB}B 규모에서 안정적인 거래가 이루어지고 있으며, 약한 상승 모멘텀이 감지됩니다.`
            : `${symbol} shows modest ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}% movement in 24h. Stable trading at $${marketCapB}B market cap with mild upward momentum.`
          advice = lang === 'ko'
            ? '단기적으로 안정적입니다. 추가 상승 신호를 확인한 후 진입을 고려하세요.'
            : 'Short-term stability. Wait for clearer signals before entering.'
        } else if (change24h > -2) {
          outlook = lang === 'ko' ? '중립' : lang === 'en' ? 'Neutral' : lang === 'fr' ? 'Neutre' : lang === 'de' ? 'Neutral' : 'Neutral'
          confidence = 50
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%의 미미한 변동을 보이며 횡보하고 있습니다. 시가총액 $${marketCapB}B 규모에서 방향성이 불분명하며 관망세가 우세합니다.`
            : `${symbol} trading sideways with ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}% in 24h. Direction unclear at $${marketCapB}B market cap.`
          advice = lang === 'ko'
            ? '방향성이 불분명합니다. 추세 확인 후 신중하게 접근하고 급격한 변동에 대비하세요.'
            : 'Direction unclear. Wait for trend confirmation and prepare for volatility.'
        } else if (change24h > -5) {
          outlook = lang === 'ko' ? '중립' : lang === 'en' ? 'Neutral' : lang === 'fr' ? 'Neutre' : lang === 'de' ? 'Neutral' : 'Neutral'
          confidence = 55
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h.toFixed(2)}%의 소폭 하락을 기록했습니다. 시가총액 $${marketCapB}B 규모에서 약한 매도 압력이 감지되지만 아직 추세 전환으로 보기는 어렵습니다.`
            : `${symbol} declined ${change24h.toFixed(2)}% in 24h. Mild selling pressure at $${marketCapB}B market cap but not yet a trend reversal.`
          advice = lang === 'ko'
            ? '소폭 하락 중이나 매수 기회가 될 수 있습니다. 지지선을 확인하고 분할 매수를 고려하세요.'
            : 'Minor decline may present buying opportunity. Check support levels and consider averaging in.'
        } else if (change24h > -10) {
          outlook = lang === 'ko' ? '하락' : lang === 'en' ? 'Bearish' : lang === 'fr' ? 'Baissier' : lang === 'de' ? 'Bärisch' : 'Bajista'
          confidence = 65
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h.toFixed(2)}%의 하락을 보이고 있습니다. 시가총액 $${marketCapB}B 규모에서 매도 압력이 증가하고 있으며 단기 조정이 진행 중입니다.`
            : `${symbol} down ${change24h.toFixed(2)}% in 24h. Selling pressure increasing at $${marketCapB}B market cap with short-term correction underway.`
          advice = lang === 'ko'
            ? '하락 추세입니다. 손절매를 고려하거나 반등 시그널을 기다리세요. 추가 하락에 대비하세요.'
            : 'Downtrend active. Consider stop-loss or wait for bounce signals. Prepare for further decline.'
        } else {
          outlook = lang === 'ko' ? '하락' : lang === 'en' ? 'Bearish' : lang === 'fr' ? 'Baissier' : lang === 'de' ? 'Bärisch' : 'Bajista'
          confidence = 75
          reasoning = lang === 'ko'
            ? `${symbol}이(가) 24시간 동안 ${change24h.toFixed(2)}%의 급격한 하락을 기록했습니다. 시가총액 $${marketCapB}B 규모에서 강한 매도세가 나타나고 있으며 투자 심리가 악화되고 있습니다.`
            : `${symbol} plunged ${change24h.toFixed(2)}% in 24h. Strong selling pressure at $${marketCapB}B market cap with deteriorating sentiment.`
          advice = lang === 'ko'
            ? '급격한 하락세입니다. 손실 최소화를 우선하고 시장이 안정될 때까지 관망하는 것이 좋습니다.'
            : 'Sharp decline. Prioritize loss minimization and wait for market stabilization.'
        }
        
        return {
          coinId,
          symbol,
          name: coinNames[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1),
          currentPrice: coinData.usd,
          change24h: change24h,
          analysis: {
            outlook: outlook,
            confidence: confidence,
            reasoning: reasoning,
            advice: advice
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
  // 🌍 언어 파라미터 감지 (쿼리 또는 쿠키)
  const lang = c.req.query('lang') || 'ko'
  
  return c.render(
    <div class="container">
      <header class="dashboard-header" role="banner">
        <div class="header-content">
          <div class="header-main">
            <div class="header-icon" role="img" aria-label="돈 아이콘">💰</div>
            <h1 id="pageTitle">Crypto Real-time Dashboard</h1>
          </div>
          
          {/* 언어 선택 */}
          <div class="language-selector" role="navigation" aria-label="언어 선택">
            <button onclick="changeLanguage('ko')" class="lang-btn" data-lang="ko" title="한국어" aria-label="한국어로 변경">
              <span class="fi fi-kr" role="img" aria-label="한국 국기"></span>
            </button>
            <button onclick="changeLanguage('en')" class="lang-btn" data-lang="en" title="English" aria-label="Change to English">
              <span class="fi fi-us" role="img" aria-label="US flag"></span>
            </button>
            <button onclick="changeLanguage('fr')" class="lang-btn" data-lang="fr" title="Français" aria-label="Changer en français">
              <span class="fi fi-fr" role="img" aria-label="Drapeau français"></span>
            </button>
            <button onclick="changeLanguage('de')" class="lang-btn" data-lang="de" title="Deutsch" aria-label="Auf Deutsch ändern">
              <span class="fi fi-de" role="img" aria-label="Deutsche Flagge"></span>
            </button>
            <button onclick="changeLanguage('es')" class="lang-btn" data-lang="es" title="Español" aria-label="Cambiar a español">
              <span class="fi fi-es" role="img" aria-label="Bandera española"></span>
            </button>
          </div>
        </div>
      </header>
      
      {/* 빠른 네비게이션 바 */}
      <nav role="navigation" aria-label="주요 메뉴" style={{
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          padding: '0 1rem'
        }} 
        class="nav-grid">
          <button 
            onclick="document.getElementById('app').scrollIntoView({ behavior: 'smooth', block: 'start' })"
            class="nav-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 1.2rem',
              background: 'rgba(102, 126, 234, 0.2)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
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
            class="nav-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 1.2rem',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
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
            class="nav-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 1.2rem',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
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
            onclick="window.location.href='/blog'"
            class="nav-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 1.2rem',
              background: 'rgba(251, 146, 60, 0.2)',
              border: '2px solid rgba(251, 146, 60, 0.3)',
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
            <i class="fas fa-blog" style={{fontSize: '1.1rem'}}></i>
            <span id="navPortfolio">블로그</span>
          </button>
        </div>
      </nav>
      
      {/* 광고 영역 1: 헤더 아래 배너 (상단) - 데스크톱용 */}
      <div class="ad-container ad-header ad-desktop-only" style={{marginTop: '2rem', marginBottom: '2rem'}}>
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998', pointerEvents: 'auto'}}>
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
              margin: 'auto',
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>
      
      {/* 모바일 전용 광고 - 상단 (A-Ads) */}
      <div class="ad-banner-mobile ad-mobile-top">
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998', pointerEvents: 'auto'}}>
          <iframe 
            data-aa='2422071' 
            src='//acceptable.a-ads.com/2422071/?size=Adaptive'
            style={{
              border: '0',
              padding: '0',
              width: '70%',
              height: 'auto',
              overflow: 'hidden',
              display: 'block',
              margin: 'auto',
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>
      
      <main id="app" role="main" aria-label="암호화폐 대시보드 메인 콘텐츠">
        <div class="loading">데이터 로딩 중...</div>
      </main>
      
      {/* 광고 영역 3: 하단 배너 (페이지 맨 아래) - 데스크톱용 */}
      <div class="ad-container ad-bottom ad-desktop-only" style={{marginTop: '2rem', marginBottom: '3rem'}}>
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998', pointerEvents: 'auto'}}>
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
              margin: 'auto',
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>
      
      {/* 모바일 전용 광고 - 하단 (A-Ads) */}
      <div class="ad-banner-mobile ad-mobile-bottom">
        <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: '99998', pointerEvents: 'auto'}}>
          <iframe 
            data-aa='2422071' 
            src='//acceptable.a-ads.com/2422071/?size=Adaptive'
            style={{
              border: '0',
              padding: '0',
              width: '70%',
              height: 'auto',
              overflow: 'hidden',
              display: 'block',
              margin: 'auto',
              pointerEvents: 'auto'
            }}
          />
        </div>
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
      
      {/* 🎯 바이낸스 광고 모달 (AI 전망 보기 전) */}
      <div 
        id="binanceAdModal" 
        class="modal" 
        style={{display: 'none', zIndex: '10001'}}
      >
        <div 
          class="modal-content" 
          style={{
            maxWidth: '600px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #f0b90b',
            boxShadow: '0 0 40px rgba(240, 185, 11, 0.3)'
          }}
        >
          {/* 헤더 */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid rgba(240, 185, 11, 0.3)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>💎</div>
            <h2 style={{
              margin: '0',
              fontSize: '1.75rem',
              background: 'linear-gradient(135deg, #f0b90b 0%, #ffd700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700'
            }} id="adModalTitle">
              AI 전망은 바이낸스가 후원합니다
            </h2>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#94a3b8',
              fontSize: '0.95rem'
            }} id="adModalSubtitle">
              잠시만 기다려주세요...
            </p>
          </div>
          
          {/* 바이낸스 배너 */}
          <div style={{
            background: 'linear-gradient(135deg, #f0b90b 0%, #ffd700 100%)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onclick="window.open('https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00HN6U5C77', '_blank')"
          onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 8px 32px rgba(240, 185, 11, 0.4)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';"
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>🚀</div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              color: '#1e293b',
              fontWeight: '700'
            }} id="binanceBannerTitle">
              전세계 1위 암호화폐 거래소
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1.1rem',
              color: '#334155',
              fontWeight: '600'
            }} id="binanceBannerSubtitle">
              바이낸스에서 지금 거래하세요!
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#1e293b',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              <span style={{
                color: '#f0b90b',
                fontSize: '1rem',
                fontWeight: '600'
              }} id="binanceCTA">
                지금 가입하고 수수료 20% 할인 받기 →
              </span>
            </div>
          </div>
          
          {/* 카운트다운 */}
          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(240, 185, 11, 0.1)',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#f0b90b',
              marginBottom: '0.5rem'
            }} id="adCountdown">5</div>
            <p style={{
              margin: '0',
              color: '#94a3b8',
              fontSize: '0.9rem'
            }} id="adCountdownText">
              초 후 AI 전망이 표시됩니다
            </p>
          </div>
          
          {/* 건너뛰기 버튼 (5초 후 활성화) */}
          <button 
            id="skipAdBtn"
            onclick="closeAdModal()" 
            disabled
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.2)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            <span id="skipBtnText">건너뛰기 (5초 대기...)</span>
          </button>
        </div>
      </div>
      
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
                  📊 거래소별 등락 표시
                </h3>
                <p style={{lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1rem'}}>
                  각 거래소의 API 특성에 따라 24시간 등락률 표시가 다릅니다:
                </p>
                <div style={{paddingLeft: '1rem'}}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <p style={{margin: '0', color: '#22c55e', fontWeight: '600'}}>
                      ✅ 등락 표시 지원 (정확한 24시간 등락률)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.95rem'}}>
                      <strong>한국</strong>: 업비트, 빗썸<br/>
                      <strong>미국/유럽</strong>: Kraken, Bitstamp
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(156, 163, 175, 0.1)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <p style={{margin: '0', color: '#9ca3af', fontWeight: '600'}}>
                      ❌ 등락 표시 미지원 (가격만 표시)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.95rem'}}>
                      <strong>한국</strong>: 코인원 (API 제한)<br/>
                      <strong>미국/유럽</strong>: Coinbase, Gemini (실시간 가격만 제공)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic'}}>
                      💡 이 거래소들은 24시간 등락률 데이터를 API로 제공하지 않습니다.
                    </p>
                  </div>
                </div>
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
                  <li><strong>Exchange Prices</strong>: Switch language to see local exchange prices (US/EU exchanges)</li>
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
                  📊 Exchange Price Changes
                </h3>
                <p style={{lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1rem'}}>
                  24-hour price change display varies by exchange API capabilities:
                </p>
                <div style={{paddingLeft: '1rem'}}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <p style={{margin: '0', color: '#22c55e', fontWeight: '600'}}>
                      ✅ Price Change Supported (accurate 24h %)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.95rem'}}>
                      <strong>Korea</strong>: Upbit, Bithumb<br/>
                      <strong>US/EU</strong>: Kraken, Bitstamp
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(156, 163, 175, 0.1)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <p style={{margin: '0', color: '#9ca3af', fontWeight: '600'}}>
                      ❌ Price Change Not Shown (price only)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.95rem'}}>
                      <strong>Korea</strong>: Coinone (API limitations)<br/>
                      <strong>US/EU</strong>: Coinbase, Gemini (spot price only)
                    </p>
                    <p style={{margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic'}}>
                      💡 These exchanges don't provide 24h change data via API.
                    </p>
                  </div>
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
      
      {/* 푸터 */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        marginTop: '3rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#94a3b8',
        fontSize: '0.9rem',
        position: 'relative',
        zIndex: '1',
        clear: 'both'
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
          © 2025 Crypto Dashboard. All rights reserved.
        </div>
      </footer>
    </div>,
    { lang } // 🌍 언어 파라미터 전달
  )
})

// 🌍 국가별 거래소 가격 API
// 각 국가별로 여러 거래소의 가격을 모두 보여줌 (거래소마다 가격이 다름)
app.get('/api/exchange-prices/:coinSymbol', async (c) => {
  try {
    const coinSymbol = c.req.param('coinSymbol').toUpperCase()
    const country = c.req.query('country') || 'kr' // kr, us, fr, de, es
    
    const exchanges: any[] = []
    let currency = 'USD'
    
    switch (country) {
      case 'kr':
        // 🇰🇷 한국: 업비트, 빗썸, 코인원
        currency = 'KRW'
        
        // 업비트
        try {
          const upbitResponse = await fetch(`https://api.upbit.com/v1/ticker?markets=KRW-${coinSymbol}`)
          const upbitData = await upbitResponse.json()
          if (upbitData.length > 0 && !upbitData[0].error) {
            exchanges.push({
              name: '업비트',
              price: upbitData[0].trade_price,
              change24h: upbitData[0].signed_change_rate * 100,
              volume24h: upbitData[0].acc_trade_price_24h
            })
          }
        } catch (error) {
          console.error('Upbit API error:', error)
        }
        
        // 빗썸
        try {
          const bithumbResponse = await fetch(`https://api.bithumb.com/public/ticker/${coinSymbol}_KRW`)
          const bithumbData = await bithumbResponse.json()
          if (bithumbData.status === '0000' && bithumbData.data) {
            exchanges.push({
              name: '빗썸',
              price: parseFloat(bithumbData.data.closing_price),
              change24h: parseFloat(bithumbData.data.fluctate_rate_24H),
              volume24h: parseFloat(bithumbData.data.acc_trade_value_24H)
            })
          }
        } catch (error) {
          console.error('Bithumb API error:', error)
        }
        
        // 코인원
        try {
          const coinoneResponse = await fetch(`https://api.coinone.co.kr/ticker/?currency=${coinSymbol.toLowerCase()}`)
          const coinoneData = await coinoneResponse.json()
          if (coinoneData.result === 'success') {
            const currentPrice = parseFloat(coinoneData.last)
            const yesterdayPrice = parseFloat(coinoneData.yesterday_last)
            const change24h = yesterdayPrice > 0 ? ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100 : 0
            
            exchanges.push({
              name: '코인원',
              price: currentPrice,
              change24h: change24h,
              volume24h: parseFloat(coinoneData.volume) * currentPrice
            })
          }
        } catch (error) {
          console.error('Coinone API error:', error)
        }
        break
        
      case 'us':
        // 🇺🇸 미국: Coinbase, Kraken, Gemini
        currency = 'USD'
        
        // Coinbase
        try {
          const coinbaseResponse = await fetch(`https://api.coinbase.com/v2/prices/${coinSymbol}-USD/spot`)
          const coinbaseData = await coinbaseResponse.json()
          if (coinbaseData.data) {
            exchanges.push({
              name: 'Coinbase',
              price: parseFloat(coinbaseData.data.amount)
            })
          }
        } catch (error) {
          console.error('Coinbase API error:', error)
        }
        
        // Kraken (USD)
        try {
          const krakenResponse = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${coinSymbol}USD`)
          const krakenData = await krakenResponse.json()
          if (krakenData.result) {
            const pairKey = Object.keys(krakenData.result)[0]
            if (pairKey) {
              const data = krakenData.result[pairKey]
              exchanges.push({
                name: 'Kraken',
                price: parseFloat(data.c[0]),
                change24h: parseFloat(data.o) > 0 ? ((parseFloat(data.c[0]) - parseFloat(data.o)) / parseFloat(data.o)) * 100 : 0,
                volume24h: parseFloat(data.v[1]) * parseFloat(data.c[0])
              })
            }
          }
        } catch (error) {
          console.error('Kraken API error:', error)
        }
        
        // Gemini
        try {
          const geminiResponse = await fetch(`https://api.gemini.com/v1/pubticker/${coinSymbol.toLowerCase()}usd`)
          const geminiData = await geminiResponse.json()
          if (geminiData.last) {
            exchanges.push({
              name: 'Gemini',
              price: parseFloat(geminiData.last),
              volume24h: parseFloat(geminiData.volume?.USD || 0)
            })
          }
        } catch (error) {
          console.error('Gemini API error:', error)
        }
        break
        
      case 'fr':
      case 'de':
      case 'es':
        // 🇪🇺 유럽: Bitstamp, Kraken, Coinbase (EUR)
        currency = 'EUR'
        
        // Bitstamp
        try {
          const bitstampResponse = await fetch(`https://www.bitstamp.net/api/v2/ticker/${coinSymbol.toLowerCase()}eur/`)
          const bitstampData = await bitstampResponse.json()
          if (bitstampData.last) {
            exchanges.push({
              name: 'Bitstamp',
              price: parseFloat(bitstampData.last),
              change24h: parseFloat(bitstampData.open) > 0 ? ((parseFloat(bitstampData.last) - parseFloat(bitstampData.open)) / parseFloat(bitstampData.open)) * 100 : 0,
              volume24h: parseFloat(bitstampData.volume) * parseFloat(bitstampData.last)
            })
          }
        } catch (error) {
          console.error('Bitstamp API error:', error)
        }
        
        // Kraken (EUR)
        try {
          const krakenResponse = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${coinSymbol}EUR`)
          const krakenData = await krakenResponse.json()
          if (krakenData.result) {
            const pairKey = Object.keys(krakenData.result)[0]
            if (pairKey) {
              const data = krakenData.result[pairKey]
              exchanges.push({
                name: 'Kraken',
                price: parseFloat(data.c[0]),
                change24h: parseFloat(data.o) > 0 ? ((parseFloat(data.c[0]) - parseFloat(data.o)) / parseFloat(data.o)) * 100 : 0,
                volume24h: parseFloat(data.v[1]) * parseFloat(data.c[0])
              })
            }
          }
        } catch (error) {
          console.error('Kraken API error:', error)
        }
        
        // Coinbase (EUR)
        try {
          const coinbaseResponse = await fetch(`https://api.coinbase.com/v2/prices/${coinSymbol}-EUR/spot`)
          const coinbaseData = await coinbaseResponse.json()
          if (coinbaseData.data) {
            exchanges.push({
              name: 'Coinbase',
              price: parseFloat(coinbaseData.data.amount)
            })
          }
        } catch (error) {
          console.error('Coinbase API error:', error)
        }
        break
    }
    
    if (exchanges.length > 0) {
      // 가격 차이 계산
      const prices = exchanges.map(e => e.price).filter(p => p > 0)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      const priceSpread = maxPrice - minPrice
      const spreadPercent = (priceSpread / avgPrice) * 100
      
      return c.json({
        coinSymbol,
        country,
        currency,
        exchanges,
        summary: {
          minPrice,
          maxPrice,
          avgPrice,
          priceSpread,
          spreadPercent: parseFloat(spreadPercent.toFixed(2))
        }
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

// 🔍 SEO: 동적 Sitemap 생성
app.get('/sitemap.xml', async (c) => {
  const today = new Date().toISOString().split('T')[0]
  
  const mainCoins = [
    'bitcoin', 'ethereum', 'ripple', 'cardano', 'solana', 
    'polkadot', 'dogecoin', 'shiba-inu', 'polygon', 'litecoin',
    'binancecoin', 'avalanche-2', 'chainlink', 'stellar', 'uniswap',
    'monero', 'tron', 'cosmos', 'ethereum-classic', 'vechain'
  ]
  
  const languages = ['ko', 'en', 'fr', 'de', 'es']
  
  // 블로그 포스트 목록
  const blogPosts = [
    {
      slug: '2025-crypto-investment-guide',
      title: '2025년 암호화폐 투자 완벽 가이드',
      description: '초보자부터 전문가까지, 2025년 암호화폐 시장 전망과 투자 전략을 완벽 정리했습니다.',
      date: '2024-12-27',
      category: '투자 가이드',
      readTime: '10분'
    },
    {
      slug: 'kimchi-premium-arbitrage',
      title: '김치 프리미엄으로 돈 버는 법',
      description: '한국 거래소와 해외 거래소의 가격 차이를 활용한 차익거래 완벽 가이드',
      date: '2024-12-26',
      category: '트레이딩',
      readTime: '8분'
    },
    {
      slug: 'ai-crypto-prediction-guide',
      title: 'AI가 예측하는 암호화폐, 믿어도 될까?',
      description: 'AI 기반 암호화폐 전망의 정확도와 올바른 활용법을 알아봅니다.',
      date: '2024-12-25',
      category: 'AI & 기술',
      readTime: '7분'
    },
    {
      slug: 'defi-beginners-guide',
      title: '초보자를 위한 DeFi 완벽 입문',
      description: 'DeFi가 뭔지, 어떻게 시작하는지, 주의할 점은 무엇인지 쉽게 설명합니다.',
      date: '2024-12-24',
      category: 'DeFi',
      readTime: '12분'
    },
    {
      slug: 'bitcoin-vs-altcoins-2025',
      title: '2025년, 비트코인 vs 알트코인 어디에 투자?',
      description: '비트코인과 알트코인의 장단점 비교와 포트폴리오 구성 전략',
      date: '2024-12-23',
      category: '시장 분석',
      readTime: '9분'
    }
  ]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- 메인 페이지 - 다국어 지원 -->
  <url>
    <loc>https://crypto-darugi.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="https://crypto-darugi.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://crypto-darugi.com/?lang=en" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://crypto-darugi.com/?lang=fr" />
    <xhtml:link rel="alternate" hreflang="de" href="https://crypto-darugi.com/?lang=de" />
    <xhtml:link rel="alternate" hreflang="es" href="https://crypto-darugi.com/?lang=es" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://crypto-darugi.com/" />
  </url>
`

  // 정적 페이지들
  const staticPages = [
    { url: '/guide', changefreq: 'weekly', priority: '0.9' },
    { url: '/faq', changefreq: 'weekly', priority: '0.9' },
    { url: '/about', changefreq: 'monthly', priority: '0.7' }
  ]
  
  for (const page of staticPages) {
    xml += `  
  <url>
    <loc>https://crypto-darugi.com${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  }
  
  // 주요 코인 개별 페이지
  for (const coin of mainCoins) {
    xml += `  
  <url>
    <loc>https://crypto-darugi.com/coin/${coin}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`
  }
  
  // 블로그 메인 페이지
  xml += `  
  <url>
    <loc>https://crypto-darugi.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`
  
  // 블로그 포스트들
  for (const post of blogPosts) {
    xml += `  
  <url>
    <loc>https://crypto-darugi.com/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`
  }
  
  xml += `</urlset>`
  
  c.header('Content-Type', 'application/xml')
  return c.body(xml)
})

// 🔍 SEO: 비트코인 전용 페이지
app.get('/coin/bitcoin', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>비트코인 (BTC) 실시간 시세 및 AI 전망 | 크립토 대시보드</title>
  <meta name="description" content="비트코인(BTC) 실시간 가격, AI 기반 전망 분석, 김치 프리미엄, 차트 분석. 업비트, 빗썸, 코인원 가격 비교. 무료 비트코인 추적 도구."/>
  <meta name="keywords" content="비트코인, BTC, 비트코인 시세, 비트코인 전망, 비트코인 AI 분석, 김치 프리미엄, 업비트, 빗썸"/>
  <link rel="canonical" href="https://crypto-darugi.com/coin/bitcoin"/>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet"/>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "비트코인 (BTC) 실시간 시세 및 AI 전망",
    "description": "비트코인 실시간 가격 추적, AI 기반 전망 분석, 김치 프리미엄 계산",
    "author": {
      "@type": "Organization",
      "name": "크립토 대시보드"
    },
    "publisher": {
      "@type": "Organization",
      "name": "크립토 대시보드",
      "logo": {
        "@type": "ImageObject",
        "url": "https://crypto-darugi.com/og-image.png"
      }
    },
    "datePublished": "${new Date().toISOString()}",
    "dateModified": "${new Date().toISOString()}"
  }
  </script>
</head>
<body class="bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">💰 비트코인 (BTC) 실시간 추적</h1>
      <p class="text-lg text-gray-300">세계 1위 암호화폐 비트코인의 실시간 가격, AI 전망, 김치 프리미엄을 확인하세요.</p>
    </header>
    
    <main>
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">📊 비트코인이란?</h2>
        <p class="text-gray-300 mb-4">
          비트코인(Bitcoin, BTC)은 2009년 사토시 나카모토가 만든 세계 최초의 암호화폐입니다. 
          블록체인 기술을 기반으로 하며, 중앙 기관 없이 P2P 네트워크에서 거래가 이루어집니다.
        </p>
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>시가총액 순위:</strong> 1위 (세계 최대 암호화폐)</li>
          <li><strong>최대 발행량:</strong> 2,100만 BTC (디플레이션 설계)</li>
          <li><strong>블록 생성 시간:</strong> 약 10분</li>
          <li><strong>주요 용도:</strong> 가치 저장, 결제 수단, 투자 자산</li>
        </ul>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">🤖 AI 전망 분석</h2>
        <p class="text-gray-300 mb-4">
          우리의 AI는 비트코인의 24시간 가격 변동, 거래량, 시장 심리를 분석하여 
          <strong>단기 전망</strong>을 제공합니다.
        </p>
        <div class="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
          <p class="text-blue-300">💡 <strong>팁:</strong> 메인 대시보드에서 실시간 AI 전망을 확인하세요!</p>
        </div>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">💰 김치 프리미엄이란?</h2>
        <p class="text-gray-300 mb-4">
          김치 프리미엄은 한국 거래소(업비트, 빗썸, 코인원)와 해외 거래소의 비트코인 가격 차이를 말합니다.
        </p>
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>양수(+):</strong> 한국이 비싸다 → 해외 매수 / 한국 매도 고려</li>
          <li><strong>음수(-):</strong> 한국이 싸다 → 한국 매수 기회</li>
          <li><strong>0% 근처:</strong> 정상 범위</li>
        </ul>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">📈 투자 전략</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-green-400 mb-2">✅ 장기 투자 (HODLing)</h3>
            <p class="text-gray-300">비트코인은 "디지털 금"으로 불리며, 장기 보유 시 가치 상승 가능성이 높습니다.</p>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-yellow-400 mb-2">⚡ 단기 트레이딩</h3>
            <p class="text-gray-300">변동성을 활용한 단기 매매. AI 전망과 차트 분석 필수.</p>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">💎 분할 매수 (DCA)</h3>
            <p class="text-gray-300">매달 일정 금액을 꾸준히 매수하여 평균 매수가를 낮추는 전략.</p>
          </div>
        </div>
      </section>
      
      <section class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 text-center">
        <h2 class="text-2xl font-bold mb-4">🚀 지금 바로 비트코인 추적하기</h2>
        <p class="text-gray-300 mb-6">실시간 가격, AI 전망, 김치 프리미엄을 무료로 확인하세요!</p>
        <a href="/" class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition">
          대시보드로 이동 →
        </a>
      </section>
    </main>
    
    <footer class="mt-12 text-center text-gray-500">
      <p>© 2024 크립토 대시보드 | <a href="/" class="text-blue-400 hover:underline">메인으로</a></p>
    </footer>
  </div>
</body>
</html>
  `)
})

// 🔍 SEO: 이더리움 전용 페이지
app.get('/coin/ethereum', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>이더리움 (ETH) 실시간 시세 및 AI 전망 | 크립토 대시보드</title>
  <meta name="description" content="이더리움(ETH) 실시간 가격, 스마트 컨트랙트 플랫폼, AI 기반 전망 분석. DeFi, NFT의 핵심 암호화폐 추적."/>
  <meta name="keywords" content="이더리움, ETH, 이더리움 시세, 스마트 컨트랙트, DeFi, NFT, 이더리움 전망"/>
  <link rel="canonical" href="https://crypto-darugi.com/coin/ethereum"/>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet"/>
</head>
<body class="bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">⚡ 이더리움 (ETH) 실시간 추적</h1>
      <p class="text-lg text-gray-300">스마트 컨트랙트 플랫폼 1위, 이더리움의 실시간 가격과 AI 전망을 확인하세요.</p>
    </header>
    
    <main>
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">📊 이더리움이란?</h2>
        <p class="text-gray-300 mb-4">
          이더리움(Ethereum, ETH)은 2015년 비탈릭 부테린이 만든 스마트 컨트랙트 플랫폼입니다. 
          단순한 화폐를 넘어 <strong>탈중앙화 애플리케이션(DApp)</strong>을 구축할 수 있는 생태계입니다.
        </p>
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>시가총액 순위:</strong> 2위</li>
          <li><strong>주요 특징:</strong> 스마트 컨트랙트, DeFi, NFT 플랫폼</li>
          <li><strong>합의 알고리즘:</strong> PoS (Proof of Stake) - 2022년 "The Merge" 이후</li>
          <li><strong>블록 생성 시간:</strong> 약 12초</li>
        </ul>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">🌐 이더리움 생태계</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-blue-900/30 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-2">🏦 DeFi (탈중앙 금융)</h3>
            <p class="text-sm text-gray-300">Uniswap, Aave, Compound 등 DeFi 프로토콜의 기반</p>
          </div>
          <div class="bg-purple-900/30 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-2">🎨 NFT (대체불가토큰)</h3>
            <p class="text-sm text-gray-300">OpenSea, Rarible 등 NFT 마켓플레이스의 핵심</p>
          </div>
          <div class="bg-green-900/30 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-2">🎮 게임 & 메타버스</h3>
            <p class="text-sm text-gray-300">Decentraland, Axie Infinity 등</p>
          </div>
          <div class="bg-yellow-900/30 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-2">🔗 Layer 2 솔루션</h3>
            <p class="text-sm text-gray-300">Polygon, Optimism, Arbitrum 확장성 개선</p>
          </div>
        </div>
      </section>
      
      <section class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 text-center">
        <h2 class="text-2xl font-bold mb-4">🚀 지금 바로 이더리움 추적하기</h2>
        <a href="/" class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition">
          대시보드로 이동 →
        </a>
      </section>
    </main>
  </div>
</body>
</html>
  `)
})

// 🔍 SEO: 사용 가이드 페이지
app.get('/guide', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>암호화폐 대시보드 사용 가이드 | 초보자 완벽 가이드</title>
  <meta name="description" content="크립토 대시보드 완벽 사용 가이드. 코인 추적, AI 전망, 포트폴리오 관리, 김치 프리미엄 활용법을 배우세요."/>
  <meta name="keywords" content="암호화폐 가이드, 코인 추적 방법, AI 전망 사용법, 포트폴리오 관리, 초보자 가이드"/>
  <link rel="canonical" href="https://crypto-darugi.com/guide"/>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet"/>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "암호화폐 대시보드 사용 방법",
    "description": "10,000개 이상 암호화폐를 추적하고 AI 전망을 활용하는 완벽 가이드",
    "step": [
      {
        "@type": "HowToStep",
        "name": "코인 검색하기",
        "text": "상단 검색창에 코인 이름이나 심볼을 입력하여 원하는 암호화폐를 찾으세요."
      },
      {
        "@type": "HowToStep",
        "name": "AI 전망 확인하기",
        "text": "AI 전망 버튼을 클릭하여 주요 코인의 단기 전망과 투자 조언을 확인하세요."
      },
      {
        "@type": "HowToStep",
        "name": "포트폴리오 추가하기",
        "text": "코인 카드의 포트폴리오 버튼으로 보유 수량과 매수가를 입력하여 수익률을 추적하세요."
      }
    ]
  }
  </script>
</head>
<body class="bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">📖 암호화폐 대시보드 사용 가이드</h1>
      <p class="text-lg text-gray-300">초보자도 쉽게 따라할 수 있는 완벽 가이드</p>
    </header>
    
    <main>
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">🚀 빠른 시작</h2>
        <ol class="space-y-4">
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <h3 class="font-bold mb-1">코인 검색하기</h3>
              <p class="text-gray-300">상단 검색창에서 원하는 코인 이름 또는 심볼(BTC, ETH 등)을 입력하세요. 10,000개 이상의 코인을 지원합니다.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
            <div>
              <h3 class="font-bold mb-1">Top 100 브라우저 활용</h3>
              <p class="text-gray-300">"Top 100 🏆" 버튼을 클릭하여 시가총액 상위 코인을 시총순, 거래량순, 등락률순으로 정렬하여 확인하세요.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 class="font-bold mb-1">즐겨찾기 추가</h3>
              <p class="text-gray-300">⭐ 별 아이콘을 클릭하여 자주 보는 코인을 즐겨찾기에 추가하세요.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">4</span>
            <div>
              <h3 class="font-bold mb-1">AI 전망 확인</h3>
              <p class="text-gray-300">🤖 AI 버튼을 클릭하여 주요 8개 코인의 1주일 단기 전망, 신뢰도, 투자 조언을 확인하세요.</p>
            </div>
          </li>
        </ol>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">💡 고급 기능</h2>
        <div class="space-y-4">
          <div class="border-l-4 border-purple-500 pl-4">
            <h3 class="font-bold text-lg mb-2">📊 포트폴리오 관리</h3>
            <p class="text-gray-300">코인 카드의 "포트폴리오" 버튼을 클릭하여 보유 수량과 평균 매수가를 입력하면, 실시간 수익률과 손익을 자동 계산합니다.</p>
          </div>
          <div class="border-l-4 border-green-500 pl-4">
            <h3 class="font-bold text-lg mb-2">💰 김치 프리미엄 추적</h3>
            <p class="text-gray-300">한국어 모드에서는 업비트, 빗썸, 코인원 가격과 김치 프리미엄(%)이 자동 표시됩니다. 차익거래 기회를 놓치지 마세요!</p>
          </div>
          <div class="border-l-4 border-yellow-500 pl-4">
            <h3 class="font-bold text-lg mb-2">📈 차트 분석</h3>
            <p class="text-gray-300">"차트" 버튼으로 7일, 30일, 90일 가격 추이를 확인할 수 있습니다.</p>
          </div>
          <div class="border-l-4 border-blue-500 pl-4">
            <h3 class="font-bold text-lg mb-2">📰 실시간 뉴스</h3>
            <p class="text-gray-300">하단 뉴스 섹션에서 최신 암호화폐 뉴스를 읽고, "번역" 버튼으로 한글로 변환하세요.</p>
          </div>
        </div>
      </section>
      
      <section class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">🔍 정렬 기능 활용</h2>
        <p class="text-gray-300 mb-4">상단의 정렬 버튼으로 코인을 다양한 기준으로 정렬할 수 있습니다:</p>
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>가격 높은순/낮은순:</strong> 코인 가격 기준 정렬</li>
          <li><strong>변동률 높은순/낮은순:</strong> 24시간 등락률 기준</li>
          <li><strong>즐겨찾기순:</strong> 내가 추가한 코인만 표시</li>
          <li><strong>김프순:</strong> 김치 프리미엄 높은 순 (한국어 모드)</li>
          <li><strong>수익률순:</strong> 포트폴리오 수익률 기준</li>
        </ul>
      </section>
      
      <section class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 text-center">
        <h2 class="text-2xl font-bold mb-4">🚀 지금 바로 시작하기</h2>
        <a href="/" class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition">
          대시보드로 이동 →
        </a>
      </section>
    </main>
  </div>
</body>
</html>
  `)
})

// 🔍 SEO: FAQ 페이지
app.get('/faq', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>자주 묻는 질문 (FAQ) | 크립토 대시보드</title>
  <meta name="description" content="암호화폐 대시보드 사용법, AI 전망, 포트폴리오, 김치 프리미엄에 대한 자주 묻는 질문과 답변"/>
  <meta name="keywords" content="암호화폐 FAQ, 크립토 대시보드 질문, AI 전망 정확도, 김치 프리미엄 계산"/>
  <link rel="canonical" href="https://crypto-darugi.com/faq"/>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet"/>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "정말 무료인가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "네! 100% 무료입니다. 회원가입도 필요 없고, 숨겨진 비용도 없습니다. 모든 기능을 완전히 무료로 사용하실 수 있습니다."
        }
      },
      {
        "@type": "Question",
        "name": "AI 전망은 얼마나 정확한가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI는 24시간 가격 변동, 거래량, 시장 심리를 분석하여 단기 전망을 제공합니다. 하지만 암호화폐 시장은 예측 불가능한 변수가 많으므로, AI 분석은 참고용으로만 활용하시고 본인의 판단과 리스크 관리가 필수입니다."
        }
      },
      {
        "@type": "Question",
        "name": "포트폴리오 데이터는 어디에 저장되나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "포트폴리오 데이터는 브라우저의 로컬 스토리지에만 저장됩니다. 서버로 전송되지 않으며, 본인의 브라우저에만 존재합니다. 시크릿 모드에서는 저장되지 않습니다."
        }
      }
    ]
  }
  </script>
</head>
<body class="bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">❓ 자주 묻는 질문</h1>
      <p class="text-lg text-gray-300">궁금한 점을 빠르게 해결하세요</p>
    </header>
    
    <main class="space-y-4">
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 정말 무료인가요?</h2>
        <p class="text-gray-300">A. 네! <strong>100% 무료</strong>입니다. 회원가입도 필요 없고, 숨겨진 비용도 없습니다. 모든 기능을 완전히 무료로 사용하실 수 있습니다.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. AI 전망은 얼마나 정확한가요?</h2>
        <p class="text-gray-300">A. AI는 24시간 가격 변동, 거래량, 시장 심리를 분석하여 단기 전망을 제공합니다. 하지만 암호화폐 시장은 예측 불가능한 변수가 많으므로, <strong>AI 분석은 참고용</strong>으로만 활용하시고 본인의 판단과 리스크 관리가 필수입니다.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 몇 개의 코인을 추적할 수 있나요?</h2>
        <p class="text-gray-300">A. <strong>10,000개 이상</strong>의 암호화폐를 추적할 수 있습니다. 비트코인, 이더리움 같은 메이저 코인부터 신규 알트코인까지 거의 모든 코인을 지원합니다.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 김치 프리미엄이란 무엇인가요?</h2>
        <p class="text-gray-300">A. 김치 프리미엄은 <strong>한국 거래소와 해외 거래소의 가격 차이</strong>를 의미합니다. 양수(+)면 한국이 비싸고, 음수(-)면 한국이 싸다는 뜻입니다. 차익거래 기회를 찾는 데 유용합니다.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 포트폴리오 데이터는 어디에 저장되나요?</h2>
        <p class="text-gray-300">A. 포트폴리오 데이터는 <strong>브라우저의 로컬 스토리지</strong>에만 저장됩니다. 서버로 전송되지 않으며, 본인의 브라우저에만 존재합니다. (시크릿 모드에서는 저장 안 됨)</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 가격이 업데이트 안 돼요</h2>
        <p class="text-gray-300">A. 가격은 <strong>30초마다 자동 업데이트</strong>됩니다. 만약 업데이트가 안 되면 "새로고침" 버튼을 클릭하거나 페이지를 새로고침하세요.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 모바일에서도 사용 가능한가요?</h2>
        <p class="text-gray-300">A. 네! <strong>모바일, 태블릿, 데스크톱</strong> 모두 지원합니다. 반응형 디자인으로 어떤 기기에서든 최적화된 화면을 제공합니다.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 다른 언어로도 볼 수 있나요?</h2>
        <p class="text-gray-300">A. 네! <strong>5개 언어</strong>를 지원합니다: 한국어, English, Français, Deutsch, Español. 우측 상단의 국기 아이콘을 클릭하여 변경하세요.</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Q. 알림 기능이 있나요?</h2>
        <p class="text-gray-300">A. 현재는 지원하지 않지만, <strong>곧 추가될 예정</strong>입니다! 가격 알림, AI 전망 업데이트 알림 등을 준비 중입니다.</p>
      </div>
      
      <div class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 text-center mt-8">
        <h2 class="text-2xl font-bold mb-4">더 궁금한 점이 있으신가요?</h2>
        <p class="text-gray-300 mb-4">대시보드 우측 하단의 💬 도움말 버튼을 클릭하세요!</p>
        <a href="/" class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition">
          대시보드로 이동 →
        </a>
      </div>
    </main>
  </div>
</body>
</html>
  `)
})

app.get('/blog', async (c) => {
  // crypto-darugi.com에서 블로그 페이지 가져오기
  try {
    const lang = c.req.query('lang') || 'ko'
    const response = await fetch(`https://crypto-darugi.com/blog?lang=${lang}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://crypto-darugi.com/',
        'Origin': 'https://crypto-darugi.com',
      }
    })
    
    // 응답이 에러 코드인지 확인
    if (!response.ok || response.status !== 200) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    let html = await response.text()
    
    // error code 체크
    if (html.includes('error code:')) {
      throw new Error('Cloudflare blocked')
    }
    
    // 제목을 두 줄로 수정 (좌측 정렬)
    html = html.replace(
      /<h1 class="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-lg">\s*📝 암호화폐 투자 블로그\s*<\/h1>/,
      `<h1 class="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-lg" style="line-height: 1.3; text-align: left;">
            📝 암호화폐<br/>투자 블로그
          </h1>`
    )
    
    return c.html(html)
  } catch (error) {
    // crypto-darugi.com 접근 불가 시 자체 페이지 제공
    const lang = c.req.query('lang') || 'ko'
    return c.html(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>📝 암호화폐 투자 블로그</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <div class="container mx-auto px-4 py-12">
          <!-- 헤더 -->
          <div class="mb-12">
            <h1 class="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-lg" style="line-height: 1.3; text-align: left;">
              📝 암호화폐<br/>투자 블로그
            </h1>
            <p class="text-xl md:text-2xl text-white/95 leading-relaxed font-medium">
              실전 투자 노하우와 AI 기반 시장 분석을 공유합니다
            </p>
          </div>

          <!-- 블로그 게시글 목록 -->
          <div class="max-w-4xl mx-auto space-y-6">
            <!-- 게시글 1 -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer" 
                 onclick="window.location.href='/blog/2025-crypto-investment-guide'">
              <div class="flex items-start gap-4">
                <div class="text-5xl">📈</div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold text-white mb-3">2025 암호화폐 투자 가이드</h2>
                  <p class="text-white/80 mb-4 leading-relaxed">
                    2025년 암호화폐 시장 전망과 투자 전략을 상세히 분석합니다. 
                    비트코인 ETF 승인 이후 달라진 시장 환경과 알트코인 투자 포인트를 다룹니다.
                  </p>
                  <div class="flex items-center gap-4 text-white/60 text-sm">
                    <span><i class="far fa-calendar"></i> 2025-01-15</span>
                    <span><i class="far fa-clock"></i> 10분 소요</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 홈으로 돌아가기 버튼 -->
            <div class="text-center mt-12">
              <button onclick="window.location.href='/'" 
                      class="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                <i class="fas fa-home mr-2"></i>
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
  }
})

// 📝 블로그 게시글 라우트
app.get('/blog/2025-crypto-investment-guide', async (c) => {
  try {
    const lang = c.req.query('lang') || 'ko'
    const response = await fetch(`https://crypto-darugi.com/blog/2025-crypto-investment-guide?lang=${lang}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })
    const html = await response.text()
    return c.html(html)
  } catch (error) {
    return c.html('<h1>게시글을 불러올 수 없습니다.</h1>', 500)
  }
})

// 📝 블로그 와일드카드 라우트 (다른 모든 블로그 글)
app.get('/blog/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const lang = c.req.query('lang') || 'ko'
    const response = await fetch(`https://crypto-darugi.com/blog/${slug}?lang=${lang}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })
    const html = await response.text()
    return c.html(html)
  } catch (error) {
    return c.html('<h1>게시글을 불러올 수 없습니다.</h1>', 500)
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
