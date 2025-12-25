// 페이지 로드 시 대시보드 초기화
window.addEventListener('DOMContentLoaded', () => {
  // 언어별 SEO 메타 태그 업데이트
  updateSEOMetaTags();
  
  // 언어 설정 적용
  document.getElementById('pageTitle').textContent = t('title');
  document.title = t('title');
  
  // 네비게이션 번역
  const navCoins = document.getElementById('navCoins');
  if (navCoins) navCoins.textContent = t('navCoins');
  
  const navAI = document.getElementById('navAI');
  if (navAI) navAI.textContent = t('navAI');
  
  const navNews = document.getElementById('navNews');
  if (navNews) navNews.textContent = t('navNews');
  
  const navPortfolio = document.getElementById('navPortfolio');
  if (navPortfolio) navPortfolio.textContent = t('navPortfolio');
  
  // 광고 레이블 번역
  const adLabel = document.getElementById('adLabel');
  if (adLabel) adLabel.textContent = t('advertisement');
  
  // 광고 문의 번역
  const adInquiryTitle = document.getElementById('adInquiryTitle');
  if (adInquiryTitle) adInquiryTitle.textContent = t('adInquiryTitle');
  
  const adInquiryDesc = document.getElementById('adInquiryDesc');
  if (adInquiryDesc) adInquiryDesc.textContent = t('adInquiryDesc');
  
  // 차트 기간 버튼 번역
  const chartBtn7 = document.getElementById('chartBtn7');
  if (chartBtn7) chartBtn7.textContent = t('days7');
  
  const chartBtn30 = document.getElementById('chartBtn30');
  if (chartBtn30) chartBtn30.textContent = t('days30');
  
  const chartBtn90 = document.getElementById('chartBtn90');
  if (chartBtn90) chartBtn90.textContent = t('days90');
  
  const chartLoadingText = document.getElementById('chartLoadingText');
  if (chartLoadingText) chartLoadingText.textContent = t('chartLoading');
  
  // 포트폴리오 폼 라벨 번역
  const portfolioAmountLabel = document.getElementById('portfolioAmountLabel');
  if (portfolioAmountLabel) portfolioAmountLabel.innerHTML = `<i class="fas fa-coins"></i> ${t('amount')}`;
  
  const portfolioAvgPriceLabel = document.getElementById('portfolioAvgPriceLabel');
  if (portfolioAvgPriceLabel) portfolioAvgPriceLabel.innerHTML = `<i class="fas fa-dollar-sign"></i> ${t('avgBuyPrice')}`;
  
  const portfolioCurrentPriceLabel = document.getElementById('portfolioCurrentPriceLabel');
  if (portfolioCurrentPriceLabel) portfolioCurrentPriceLabel.innerHTML = `<i class="fas fa-chart-line"></i> ${t('currentPrice')}`;
  
  const portfolioPlaceholder = document.getElementById('portfolioPlaceholder');
  if (portfolioPlaceholder) portfolioPlaceholder.textContent = t('enterAmountAndPrice');
  
  const portfolioSaveBtn = document.getElementById('portfolioSaveBtn');
  if (portfolioSaveBtn) portfolioSaveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('save')}`;
  
  const portfolioCancelBtn = document.getElementById('portfolioCancelBtn');
  if (portfolioCancelBtn) portfolioCancelBtn.textContent = t('cancel');
  
  // 푸터 문의 라벨 번역
  const contactLabel = document.getElementById('contactLabel');
  if (contactLabel) contactLabel.textContent = t('contact');
  
  // 사용설명서 모달 타이틀 번역
  const userGuideTitle = document.getElementById('userGuideTitle');
  if (userGuideTitle) userGuideTitle.textContent = t('userGuideTitle');
  
  // 사용설명서 언어별 가이드 표시/숨김
  document.querySelectorAll('.guide-lang').forEach(guide => {
    guide.style.display = 'none';
  });
  const currentGuide = document.querySelector(`.guide-${currentLang}`);
  if (currentGuide) {
    currentGuide.style.display = 'block';
  } else {
    // 해당 언어가 없으면 영어 표시
    const enGuide = document.querySelector('.guide-en');
    if (enGuide) enGuide.style.display = 'block';
  }
  
  // 현재 언어 버튼 활성화
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  loadSelectedCoins();
  loadPortfolio();
  loadFavorites();
  loadSelectedExchange();
  loadPrices();
  loadCryptoNews();
  // AI 전망 자동 복원 (이전에 로드했던 경우)
  autoLoadAIForecastIfNeeded();
  
  startAutoRefresh();
});

// 🌍 언어별 SEO 메타 태그 업데이트
function updateSEOMetaTags() {
  const seoContent = {
    ko: {
      title: '암호화폐 실시간 대시보드 | AI 전망, 10,000+ 코인 추적, 김치 프리미엄',
      description: 'AI 기반 코인 전망과 10,000개 이상의 암호화폐를 실시간 추적. 김치 프리미엄 계산기, 업비트/빗썸/코인원 가격 비교, 포트폴리오 관리, 실시간 뉴스 번역. 무료!',
      keywords: '암호화폐, 비트코인, 이더리움, AI 전망, 코인 분석, 김치 프리미엄, 업비트, 빗썸, 코인원, 실시간 시세, 포트폴리오, 크립토 대시보드',
      ogTitle: '암호화폐 실시간 대시보드 | AI 전망, 김치 프리미엄',
      ogDescription: 'AI 기반 코인 전망, 10,000+ 암호화폐 실시간 추적, 김치 프리미엄 계산, 포트폴리오 관리. 무료!',
      lang: 'ko',
      locale: 'ko_KR'
    },
    en: {
      title: 'Crypto Real-time Dashboard | AI Forecast, 10,000+ Coins Tracker',
      description: 'AI-powered crypto forecast and track 10,000+ cryptocurrencies in real-time. Compare prices on Coinbase, manage portfolio, live crypto news. Free!',
      keywords: 'cryptocurrency, bitcoin, ethereum, AI forecast, crypto analysis, crypto dashboard, real-time crypto prices, coinbase, crypto portfolio, btc, eth',
      ogTitle: 'Crypto Real-time Dashboard | AI Forecast & Portfolio Tracker',
      ogDescription: 'AI-powered crypto forecast, track 10,000+ cryptocurrencies in real-time. Coinbase prices, portfolio management. 100% Free!',
      lang: 'en',
      locale: 'en_US'
    },
    fr: {
      title: 'Tableau de Bord Crypto en Temps Réel | Prévision IA, 10,000+ Cryptos',
      description: 'Prévisions crypto alimentées par IA et suivez 10,000+ cryptomonnaies en temps réel. Comparez les prix sur Bitstamp, gérez portefeuille, actualités crypto. Gratuit!',
      keywords: 'cryptomonnaie, bitcoin, ethereum, prévision IA, analyse crypto, tableau de bord crypto, prix crypto temps réel, bitstamp, portefeuille crypto',
      ogTitle: 'Tableau de Bord Crypto | Prévision IA & Tracker Gratuit',
      ogDescription: 'Prévisions crypto par IA, suivez 10,000+ cryptos en temps réel. Prix Bitstamp, gestion de portefeuille. 100% Gratuit!',
      lang: 'fr',
      locale: 'fr_FR'
    },
    de: {
      title: 'Echtzeit-Krypto-Dashboard | KI-Prognose, 10,000+ Kryptowährungen',
      description: 'KI-gestützte Krypto-Prognose und verfolgen Sie 10,000+ Kryptowährungen in Echtzeit. Vergleichen Sie Preise auf Kraken, verwalten Sie Portfolio, Live-Nachrichten. Kostenlos!',
      keywords: 'kryptowährung, bitcoin, ethereum, KI-prognose, krypto-analyse, krypto dashboard, echtzeit krypto preise, kraken, krypto portfolio',
      ogTitle: 'Echtzeit-Krypto-Dashboard | KI-Prognose & Tracker',
      ogDescription: 'KI-Krypto-Prognose, verfolgen Sie 10,000+ Kryptos in Echtzeit. Kraken-Preise, Portfolio-Verwaltung. 100% Kostenlos!',
      lang: 'de',
      locale: 'de_DE'
    },
    es: {
      title: 'Panel Cripto en Tiempo Real | Pronóstico IA, 10,000+ Criptomonedas',
      description: 'Pronóstico cripto con IA y rastrea 10,000+ criptomonedas en tiempo real. Compara precios en Binance, administra cartera, noticias cripto en vivo. ¡Gratis!',
      keywords: 'criptomoneda, bitcoin, ethereum, pronóstico IA, análisis cripto, panel cripto, precios cripto tiempo real, binance, cartera cripto',
      ogTitle: 'Panel Cripto en Tiempo Real | Pronóstico IA & Rastreador',
      ogDescription: 'Pronóstico cripto con IA, rastrea 10,000+ criptos en tiempo real. Precios Binance, gestión de cartera. ¡100% Gratis!',
      lang: 'es',
      locale: 'es_ES'
    }
  };

  const content = seoContent[currentLang] || seoContent.en;
  
  // 페이지 제목
  document.title = content.title;
  
  // HTML lang 속성
  document.documentElement.lang = content.lang;
  
  // 메타 태그 업데이트
  updateMetaTag('name', 'description', content.description);
  updateMetaTag('name', 'keywords', content.keywords);
  updateMetaTag('name', 'language', content.lang.charAt(0).toUpperCase() + content.lang.slice(1));
  
  // Open Graph 태그
  updateMetaTag('property', 'og:title', content.ogTitle);
  updateMetaTag('property', 'og:description', content.ogDescription);
  updateMetaTag('property', 'og:locale', content.locale);
  
  // Twitter Card
  updateMetaTag('name', 'twitter:title', content.ogTitle);
  updateMetaTag('name', 'twitter:description', content.ogDescription);
}

// 메타 태그 업데이트 헬퍼 함수
function updateMetaTag(attr, attrValue, content) {
  let meta = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

// 🌍 언어별 국가 코드 매핑
const countryMapping = {
  'ko': 'kr', // 한국
  'en': 'us', // 미국
  'fr': 'fr', // 프랑스
  'de': 'de', // 독일
  'es': 'es'  // 스페인
};

// 코인 ID → 심볼 매핑
const coinSymbolMap = {
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
  'uniswap': 'UNI'
};

// 선택된 코인 (로컬 스토리지에서 불러오기)
let selectedCoins = [];
let allCoinsCache = []; // 전체 코인 목록 캐시
let portfolio = {}; // 포트폴리오: { coinId: { amount: 0, avgPrice: 0 } }
let chartInstances = {}; // 차트 인스턴스 저장용

// 로컬 스토리지에서 선택한 코인 불러오기
function loadSelectedCoins() {
  const saved = localStorage.getItem('selectedCoins');
  if (saved) {
    selectedCoins = JSON.parse(saved);
  } else {
    // 기본값: 주요 3개 코인
    selectedCoins = ['bitcoin', 'ethereum', 'ripple'];
  }
}

// 포트폴리오 불러오기
function loadPortfolio() {
  const saved = localStorage.getItem('portfolio');
  if (saved) {
    portfolio = JSON.parse(saved);
  }
}

// 포트폴리오 저장
function savePortfolio() {
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// 선택한 코인 저장
function saveSelectedCoins() {
  localStorage.setItem('selectedCoins', JSON.stringify(selectedCoins));
}

// 코인 선택 토글
function toggleCoin(coinId, coinName, coinSymbol) {
  const index = selectedCoins.indexOf(coinId);
  if (index > -1) {
    // 최소 1개는 선택되어야 함
    if (selectedCoins.length > 1) {
      selectedCoins.splice(index, 1);
    } else {
      alert(t('minOneCoinRequired'));
      return;
    }
  } else {
    selectedCoins.push(coinId);
  }
  saveSelectedCoins();
  loadPrices();
}

// 코인 검색
let searchTimeout;
async function searchCoins(query) {
  if (query.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const response = await axios.get(`/api/coins/search?q=${encodeURIComponent(query)}`);
      const { coins } = response.data;
      
      if (coins.length === 0) {
        document.getElementById('searchResults').innerHTML = `<div class="search-no-results">${t('noSearchResults')}</div>`;
        return;
      }
      
      let html = '<div class="search-results-list">';
      coins.forEach(coin => {
        const isSelected = selectedCoins.includes(coin.id);
        const rank = coin.market_cap_rank ? `#${coin.market_cap_rank}` : '';
        html += `
          <div class="search-result-item ${isSelected ? 'selected' : ''}" onclick="toggleCoin('${coin.id}', '${coin.name}', '${coin.symbol}')">
            <img src="${coin.thumb}" alt="${coin.name}" class="coin-thumb">
            <div class="coin-info">
              <div class="coin-name-search">${coin.name} (${coin.symbol})</div>
              <div class="coin-rank">${rank}</div>
            </div>
            ${isSelected ? '<i class="fas fa-check text-green-400"></i>' : '<i class="fas fa-plus text-gray-400"></i>'}
          </div>
        `;
      });
      html += '</div>';
      
      document.getElementById('searchResults').innerHTML = html;
    } catch (error) {
      console.error('검색 실패:', error);
      document.getElementById('searchResults').innerHTML = `<div class="search-error">${t('searchError')}</div>`;
    }
  }, 300);
}

// Top 100 코인 정렬 상태
let topCoinsSort = 'marketcap'; // marketcap, volume, gainers, losers

// Top 100 코인 브라우저 열기 (별칭)
function openCoinBrowser() {
  // 모달 타이틀 다국어 처리
  const modalTitle = document.getElementById('coinBrowserModalTitle');
  if (modalTitle) {
    modalTitle.textContent = t('top100Title');
  }
  showCoinBrowser();
}

// Top 100 코인 브라우저 표시
async function showCoinBrowser() {
  const modal = document.getElementById('coinBrowserModal');
  const content = document.getElementById('coinBrowserContent');
  
  modal.style.display = 'flex';
  content.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> ${t('loading')}</div>`;
  
  try {
    // API에서 Top 100 가져오기
    const response = await axios.get('/api/coins/list?limit=100');
    let coins = response.data.coins || [];
    
    // 정렬 적용
    sortTopCoins(coins);
    
    // 정렬 버튼 HTML
    const sortButtons = `
      <div class="top-coins-sort">
        <button class="sort-btn ${topCoinsSort === 'marketcap' ? 'active' : ''}" onclick="changeTopCoinsSort('marketcap')">
          <i class="fas fa-chart-pie"></i> ${t('sortByMarketCap')}
        </button>
        <button class="sort-btn ${topCoinsSort === 'volume' ? 'active' : ''}" onclick="changeTopCoinsSort('volume')">
          <i class="fas fa-exchange-alt"></i> ${t('sortByVolume')}
        </button>
        <button class="sort-btn ${topCoinsSort === 'gainers' ? 'active' : ''}" onclick="changeTopCoinsSort('gainers')">
          <i class="fas fa-arrow-up"></i> ${t('sortByGainers')}
        </button>
        <button class="sort-btn ${topCoinsSort === 'losers' ? 'active' : ''}" onclick="changeTopCoinsSort('losers')">
          <i class="fas fa-arrow-down"></i> ${t('sortByLosers')}
        </button>
      </div>
    `;
    
    // 코인 목록 HTML
    let coinsHTML = '<div class="top-coins-grid">';
    coins.slice(0, 100).forEach((coin, index) => {
      const isSelected = selectedCoins.includes(coin.id);
      const change = Number(coin.price_change_percentage_24h) || 0;
      const changeClass = change >= 0 ? 'positive' : 'negative';
      const changeArrow = change >= 0 ? '▲' : '▼';
      
      coinsHTML += `
        <div class="top-coin-card ${isSelected ? 'selected' : ''}" onclick="toggleCoin('${coin.id}')">
          <div class="top-coin-rank">#${index + 1}</div>
          <img src="${coin.image}" alt="${coin.name}" class="top-coin-image">
          <div class="top-coin-name">${coin.name}</div>
          <div class="top-coin-symbol">${coin.symbol.toUpperCase()}</div>
          <div class="top-coin-price">${formatPrice(coin.current_price)}</div>
          <div class="top-coin-change ${changeClass}">
            ${changeArrow} ${Math.abs(change).toFixed(2)}%
          </div>
          <div class="top-coin-marketcap">
            ${formatMarketCap(coin.market_cap, 'usd')}
          </div>
          ${isSelected ? `<div class="top-coin-selected"><i class="fas fa-check"></i> ${t('selected')}</div>` : ''}
        </div>
      `;
    });
    coinsHTML += '</div>';
    
    content.innerHTML = sortButtons + coinsHTML;
    
  } catch (error) {
    console.error('Top 100 로드 실패:', error);
    content.innerHTML = `
      <div class="error" style="padding: 2rem; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${t('errorLoadingTop100') || 'Top 100 코인을 불러올 수 없습니다'}</h3>
        <p style="color: #9ca3af; margin-bottom: 1rem;">
          ${t('apiLimitReached') || 'CoinGecko API 요청 제한에 도달했습니다.'}<br>
          ${t('useSearchInstead') || '검색 기능을 사용하여 원하는 코인을 추가해주세요.'}
        </p>
        <button class="btn-primary" onclick="closeCoinBrowser()" style="margin-top: 1rem;">
          <i class="fas fa-times"></i> ${t('close')}
        </button>
      </div>
    `;
  }
}

// Top 코인 정렬
function sortTopCoins(coins) {
  switch(topCoinsSort) {
    case 'marketcap':
      // 이미 시가총액순으로 정렬됨
      break;
    case 'volume':
      coins.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
      break;
    case 'gainers':
      coins.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
      break;
    case 'losers':
      coins.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
      break;
  }
}

// Top 코인 정렬 변경
function changeTopCoinsSort(sortType) {
  topCoinsSort = sortType;
  showCoinBrowser(); // 재로드
}

// 모달 닫기
function closeCoinBrowser() {
  document.getElementById('coinBrowserModal').style.display = 'none';
}

// 가격 포맷팅
function formatPrice(price, currency = 'usd') {
  if (currency === 'krw') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(price);
}

// 시가총액 포맷팅
function formatMarketCap(value, currency = 'krw') {
  // undefined/null 체크
  if (!value || isNaN(value)) {
    return currency === 'krw' ? '₩0' : '$0';
  }
  
  value = Number(value);
  
  if (currency === 'krw' && currentLang === 'ko') {
    if (value >= 1e15) {
      return '₩' + (value / 1e12).toFixed(2) + '조';
    } else if (value >= 1e12) {
      return '₩' + (value / 1e12).toFixed(2) + '조';
    } else if (value >= 1e9) {
      return '₩' + (value / 1e9).toFixed(2) + '십억';
    } else if (value >= 1e6) {
      return '₩' + (value / 1e6).toFixed(2) + '백만';
    }
    return '₩' + value.toFixed(0);
  }
  
  // USD (all languages)
  if (value >= 1e12) {
    return '$' + (value / 1e12).toFixed(2) + 'T';
  } else if (value >= 1e9) {
    return '$' + (value / 1e9).toFixed(2) + 'B';
  } else if (value >= 1e6) {
    return '$' + (value / 1e6).toFixed(2) + 'M';
  }
  return '$' + value.toFixed(2);
}

// 가격 변화율 표시
function getPriceChangeHTML(change) {
  if (!change || isNaN(change)) {
    return `<span class="price-change">0.00%</span>`;
  }
  change = Number(change);
  const isPositive = change >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const className = isPositive ? 'positive' : 'negative';
  return `<span class="price-change ${className}">${arrow} ${Math.abs(change).toFixed(2)}%</span>`;
}

// 현재 선택된 코인 (차트용)
let currentChartCoinId = '';

// 차트 모달 열기
function openChartModal(coinId, coinName) {
  currentChartCoinId = coinId;
  const modal = document.getElementById('chartModal');
  const modalTitle = document.getElementById('chartModalTitle');
  modalTitle.textContent = `${coinName} ${t('priceChart')}`;
  modal.style.display = 'flex';
  
  // 기본 7일 차트 로드
  loadChart(coinId, 7);
}

// 차트 모달 닫기
function closeChartModal() {
  const modal = document.getElementById('chartModal');
  modal.style.display = 'none';
  
  // 차트 인스턴스 제거
  if (chartInstances.priceChart) {
    chartInstances.priceChart.destroy();
    delete chartInstances.priceChart;
  }
}

// 차트 로드
async function loadChart(coinId, days = 7) {
  console.log('[Chart] Loading chart for:', coinId, 'days:', days);
  const ctx = document.getElementById('priceChart');
  if (!ctx) {
    console.error('[Chart] Canvas element not found');
    return;
  }
  
  try {
    // 로딩 표시
    const loadingDiv = document.getElementById('chartLoading');
    loadingDiv.style.display = 'block';
    console.log('[Chart] Loading indicator shown');
    
    // 기존 차트 제거
    if (chartInstances.priceChart) {
      console.log('[Chart] Destroying previous chart');
      chartInstances.priceChart.destroy();
    }
    
    // 차트 데이터 가져오기
    console.log('[Chart] Fetching data from API...');
    const response = await axios.get(`/api/chart/${coinId}?days=${days}`);
    const data = response.data;
    console.log('[Chart] Data received:', data.prices ? data.prices.length : 0, 'points');
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // 가격 데이터 추출
    const prices = data.prices.map(p => ({
      x: new Date(p[0]),
      y: p[1]
    }));
    console.log('[Chart] Processed prices:', prices.length, 'points');
    
    // 로딩 숨기기
    loadingDiv.style.display = 'none';
    console.log('[Chart] Loading indicator hidden');
    
    // Chart.js로 차트 그리기
    console.log('[Chart] Creating Chart.js instance...');
    chartInstances.priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Price (USD)',
          data: prices,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Price: $' + context.parsed.y.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: days <= 7 ? 'hour' : 'day'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
    
    console.log('[Chart] Chart created successfully!');
    
    // 차트 기간 버튼 업데이트
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-days') == days) {
        btn.classList.add('active');
      }
    });
    
  } catch (error) {
    console.error('[Chart] Failed to load chart:', error);
    console.error('[Chart] Error details:', error.response ? error.response.data : error.message);
    const loadingDiv = document.getElementById('chartLoading');
    loadingDiv.innerHTML = `<p class="text-red-400"><i class="fas fa-exclamation-triangle"></i> ${t('chartErrorCheckConsole')}</p>`;
  }
}

// 포트폴리오 모달 열기
function openPortfolioModal(coinId, coinName, currentPrice) {
  const modal = document.getElementById('portfolioModal');
  const modalTitle = document.getElementById('portfolioModalTitle');
  modalTitle.textContent = `${coinName} ${t('portfolioManagement')}`;
  
  // 현재 포트폴리오 정보 불러오기
  const portfolioData = portfolio[coinId] || { amount: 0, avgPrice: 0 };
  
  // 폼에 데이터 채우기
  document.getElementById('portfolioCoinId').value = coinId;
  document.getElementById('portfolioAmount').value = portfolioData.amount || '';
  document.getElementById('portfolioAvgPrice').value = portfolioData.avgPrice || '';
  document.getElementById('currentPrice').textContent = formatPrice(currentPrice);
  
  // 수익률 계산
  updateProfitCalculation(coinId, currentPrice);
  
  modal.style.display = 'flex';
}

// 포트폴리오 모달 닫기
function closePortfolioModal() {
  const modal = document.getElementById('portfolioModal');
  modal.style.display = 'none';
}

// 뉴스 모달 관련 변수
let currentNewsData = null;
let isNewsTranslated = false;

// 뉴스 모달 열기
function openNewsModal(newsId) {
  const newsItem = document.getElementById(newsId);
  if (!newsItem) return;
  
  const modal = document.getElementById('newsModal');
  const source = newsItem.dataset.source;
  const time = newsItem.dataset.time;
  const title = newsItem.dataset.title;
  const description = newsItem.dataset.description;
  const link = newsItem.dataset.link;
  
  // 현재 뉴스 데이터 저장
  currentNewsData = {
    originalTitle: title,
    originalDescription: description,
    translatedTitle: null,
    translatedDescription: null,
    link: link
  };
  isNewsTranslated = false;
  
  // 모달에 데이터 표시
  document.getElementById('newsModalSource').textContent = source;
  document.getElementById('newsModalTime').textContent = time;
  document.getElementById('newsModalArticleTitle').textContent = title;
  
  const descEl = document.getElementById('newsModalDescription');
  
  // 뉴스 설명 처리 - 3~5줄 표시 후 "원문 보기" 안내
  let displayText = description || '';
  
  if (!description || description.length === 0) {
    // description이 완전히 비어있으면
    displayText = currentLang === 'ko' 
      ? '이 뉴스는 요약 정보를 제공하지 않습니다.\n\n📰 전체 기사 내용을 보시려면 아래 "원문 보기" 버튼을 클릭하여 원문 사이트에서 확인해주세요.'
      : currentLang === 'fr'
      ? 'Cet article ne fournit pas de résumé.\n\n📰 Pour lire l\'article complet, cliquez sur "Voir l\'Original".'
      : currentLang === 'de'
      ? 'Dieser Artikel bietet keine Zusammenfassung.\n\n📰 Für den vollständigen Artikel klicken Sie auf "Original Ansehen".'
      : currentLang === 'es'
      ? 'Este artículo no proporciona un resumen.\n\n📰 Para el artículo completo, haga clic en "Ver Original".'
      : 'This article does not provide a summary.\n\n📰 Please click "View Original" for the full article.';
  } else {
    // description이 있으면 3~5줄 분량으로 자르기 (약 300-500자)
    const maxLength = 500;
    if (description.length > maxLength) {
      displayText = description.substring(0, maxLength) + '...';
    }
    
    // 항상 "원문 보기" 안내 추가
    const moreInfoText = currentLang === 'ko' ? '\n\n💬 내용이 궁금하시면 아래 "원문 보기" 버튼을 눌러 전체 기사를 확인하세요!' :
                         currentLang === 'fr' ? '\n\n💬 Pour en savoir plus, cliquez sur "Voir l\'Original" ci-dessous!' :
                         currentLang === 'de' ? '\n\n💬 Für weitere Informationen klicken Sie unten auf "Original Ansehen"!' :
                         currentLang === 'es' ? '\n\n💬 ¡Para más información, haga clic en "Ver Original" abajo!' :
                         '\n\n💬 For more details, click "View Original" below!';
    displayText += moreInfoText;
  }
  
  descEl.innerHTML = displayText.replace(/\n/g, '<br>');
  descEl.classList.remove('expanded');
  
  // "더 보기" 버튼은 항상 숨김 (원문 보기로 이동)
  const readMoreBtn = document.getElementById('newsReadMoreBtn');
  readMoreBtn.style.display = 'none';
  
  document.getElementById('newsModalLink').href = link;
  
  // 버튼 텍스트 초기화
  const translateBtn = document.getElementById('newsModalTranslateBtn');
  if (currentLang === 'en') {
    translateBtn.style.display = 'none';
  } else {
    translateBtn.style.display = 'inline-flex';
    translateBtn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    translateBtn.disabled = false;
  }
  
  document.getElementById('newsModalLinkText').textContent = t('viewOriginal') || '원문 보기';
  
  modal.style.display = 'flex';
}

// 뉴스 모달 닫기
function closeNewsModal() {
  const modal = document.getElementById('newsModal');
  modal.style.display = 'none';
  currentNewsData = null;
  isNewsTranslated = false;
}

// 뉴스 설명 펼치기/접기
function toggleNewsDescription() {
  const descEl = document.getElementById('newsModalDescription');
  const readMoreBtn = document.getElementById('newsReadMoreBtn');
  const readMoreBtnText = document.getElementById('newsReadMoreBtnText');
  const icon = readMoreBtn.querySelector('i');
  
  if (descEl.classList.contains('expanded')) {
    // 접기
    descEl.classList.remove('expanded');
    readMoreBtn.classList.remove('expanded');
    readMoreBtnText.textContent = t('readMore');
    icon.className = 'fas fa-chevron-down';
  } else {
    // 펼치기
    descEl.classList.add('expanded');
    readMoreBtn.classList.add('expanded');
    readMoreBtnText.textContent = t('showLess');
    icon.className = 'fas fa-chevron-up';
  }
}

// 뉴스 모달에서 번역
async function translateModalNews() {
  if (!currentNewsData) return;
  
  const translateBtn = document.getElementById('newsModalTranslateBtn');
  const titleEl = document.getElementById('newsModalArticleTitle');
  const descEl = document.getElementById('newsModalDescription');
  
  // 이미 번역된 경우 원문으로 되돌리기
  if (isNewsTranslated) {
    titleEl.textContent = currentNewsData.originalTitle;
    if (currentNewsData.originalDescription) {
      // innerHTML로 변경하여 줄바꿈 유지
      descEl.innerHTML = currentNewsData.originalDescription.replace(/\n/g, '<br>');
    }
    translateBtn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    isNewsTranslated = false;
    return;
  }
  
  try {
    translateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('translating')}`;
    translateBtn.disabled = true;
    
    // 번역 함수
    const translateText = async (text) => {
      if (!text) return '';
      const targetLang = currentLang === 'ko' ? 'ko' : currentLang === 'fr' ? 'fr' : currentLang === 'de' ? 'de' : currentLang === 'es' ? 'es' : 'en';
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();
      return data.responseData.translatedText;
    };
    
    // 제목 번역
    if (!currentNewsData.translatedTitle) {
      currentNewsData.translatedTitle = await translateText(currentNewsData.originalTitle);
    }
    
    // 설명 번역
    if (currentNewsData.originalDescription && !currentNewsData.translatedDescription) {
      currentNewsData.translatedDescription = await translateText(currentNewsData.originalDescription);
    }
    
    // 번역 결과 표시 (innerHTML로 변경하여 줄바꿈 유지)
    titleEl.textContent = currentNewsData.translatedTitle;
    if (currentNewsData.translatedDescription) {
      descEl.innerHTML = currentNewsData.translatedDescription.replace(/\n/g, '<br>');
    }
    
    translateBtn.innerHTML = `<i class="fas fa-globe"></i> ${t('original')}`;
    translateBtn.disabled = false;
    isNewsTranslated = true;
    
  } catch (error) {
    console.error('번역 실패:', error);
    translateBtn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    translateBtn.disabled = false;
    alert(t('translationError'));
  }
}

// 포트폴리오 저장
function savePortfolioData() {
  const coinId = document.getElementById('portfolioCoinId').value;
  const amount = parseFloat(document.getElementById('portfolioAmount').value) || 0;
  const avgPrice = parseFloat(document.getElementById('portfolioAvgPrice').value) || 0;
  
  if (amount > 0 && avgPrice > 0) {
    portfolio[coinId] = { amount, avgPrice };
  } else {
    // 0이면 포트폴리오에서 제거
    delete portfolio[coinId];
  }
  
  savePortfolio();
  closePortfolioModal();
  loadPrices(); // 화면 갱신
}

// 수익률 계산 업데이트
function updateProfitCalculation(coinId, currentPrice) {
  const amount = parseFloat(document.getElementById('portfolioAmount').value) || 0;
  const avgPrice = parseFloat(document.getElementById('portfolioAvgPrice').value) || 0;
  
  if (amount > 0 && avgPrice > 0) {
    const investment = amount * avgPrice;
    const currentValue = amount * currentPrice;
    const profit = currentValue - investment;
    const profitRate = ((profit / investment) * 100).toFixed(2);
    
    const isProfitable = profit >= 0;
    const profitColor = isProfitable ? 'text-green-400' : 'text-red-400';
    
    document.getElementById('profitCalculation').innerHTML = `
      <div class="profit-summary">
        <div class="profit-row">
          <span>${t('investment')}:</span>
          <span>${formatPrice(investment)}</span>
        </div>
        <div class="profit-row">
          <span>${t('currentValue')}:</span>
          <span>${formatPrice(currentValue)}</span>
        </div>
        <div class="profit-row ${profitColor}">
          <span>${isProfitable ? t('profit') : t('loss')}:</span>
          <span><strong>${formatPrice(profit)}</strong></span>
        </div>
        <div class="profit-row ${profitColor}">
          <span>${t('profitRate')}:</span>
          <span><strong>${profit >= 0 ? '+' : ''}${profitRate}%</strong></span>
        </div>
      </div>
    `;
  } else {
    document.getElementById('profitCalculation').innerHTML = `<p class="text-gray-400">${t('enterAmountAndPrice')}</p>`;
  }
}

// 포트폴리오 입력 필드 변경 시 수익률 재계산
function onPortfolioInputChange() {
  const coinId = document.getElementById('portfolioCoinId').value;
  const currentPriceText = document.getElementById('currentPrice').textContent;
  const currentPrice = parseFloat(currentPriceText.replace(/[^0-9.]/g, ''));
  updateProfitCalculation(coinId, currentPrice);
}

// 선택된 거래소 (로컬 스토리지에서 불러오기)
let selectedExchange = 'upbit';

// 거래소 불러오기
function loadSelectedExchange() {
  const saved = localStorage.getItem('selectedExchange');
  if (saved) {
    selectedExchange = saved;
  }
}

// 거래소 저장
function saveSelectedExchange() {
  localStorage.setItem('selectedExchange', selectedExchange);
}

// 거래소 변경
function changeExchange(exchange) {
  selectedExchange = exchange;
  saveSelectedExchange();
  loadPrices();
}

// 공포탐욕지수 로드
async function loadFearGreedIndex() {
  try {
    const response = await axios.get('/api/fear-greed');
    const data = response.data;
    
    if (data.error) {
      return '';
    }
    
    // 색상 및 이모지 결정
    let color = 'text-gray-400';
    let bgColor = 'rgba(156, 163, 175, 0.2)';
    let emoji = '😐';
    let advice = t('advice.neutral');
    
    if (data.value <= 24) {
      color = 'text-red-400';
      bgColor = 'rgba(239, 68, 68, 0.2)';
      emoji = '😱';
      advice = t('advice.extremeFear');
    } else if (data.value <= 49) {
      color = 'text-orange-400';
      bgColor = 'rgba(251, 146, 60, 0.2)';
      emoji = '😟';
      advice = t('advice.fear');
    } else if (data.value <= 74) {
      color = 'text-green-400';
      bgColor = 'rgba(34, 197, 94, 0.2)';
      emoji = '😊';
      advice = t('advice.neutral');
    } else {
      color = 'text-yellow-400';
      bgColor = 'rgba(234, 179, 8, 0.2)';
      emoji = '🤑';
      advice = t('advice.greed');
    }
    
    return `
      <div class="stat-card" style="background: ${bgColor}">
        <h3 class="text-xl font-bold mb-2">
          <i class="fas fa-brain text-purple-500"></i> ${t('fearGreedIndex')}
        </h3>
        <div class="text-5xl mb-2">${emoji}</div>
        <div class="text-3xl font-bold mb-2 ${color}">
          ${data.value}
        </div>
        <div class="text-sm text-gray-300 mb-1">${data.classification}</div>
        <div class="text-xs ${color} font-bold">${advice}</div>
      </div>
    `;
  } catch (error) {
    console.error('공포탐욕지수 조회 실패:', error);
    return '';
  }
}

// 암호화폐 뉴스 로드
let newsTranslations = {}; // 번역 캐시

// AI 전망 버튼 클릭 로딩
let aiForecastCurrentlyLoaded = false; // 현재 페이지에서 실제로 로드되었는지 여부
let lastLoadedAIForecastHTML = ''; // 마지막으로 로드된 AI 전망 HTML 캐시

// AI 전망 로드 상태를 localStorage에서 확인
function isAIForecastLoaded() {
  return localStorage.getItem('aiForecastLoaded') === 'true';
}

// AI 전망 로드 상태를 localStorage에 저장
function setAIForecastLoaded(loaded) {
  localStorage.setItem('aiForecastLoaded', loaded ? 'true' : 'false');
}

// AI 전망 HTML을 localStorage에 캐시
function saveAIForecastHTML(html) {
  try {
    localStorage.setItem('aiForecastHTML', html);
    localStorage.setItem('aiForecastTimestamp', Date.now().toString());
  } catch (e) {
    console.error('Failed to save AI forecast to localStorage:', e);
  }
}

// 캐시된 AI 전망 HTML 가져오기 (5분 이내면 유효)
function getCachedAIForecastHTML() {
  const html = localStorage.getItem('aiForecastHTML');
  const timestamp = localStorage.getItem('aiForecastTimestamp');
  
  if (!html || !timestamp) return null;
  
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (now - parseInt(timestamp) < fiveMinutes) {
    return html;
  }
  
  return null;
}

// 페이지 로드 시 AI 전망이 이전에 로드되었으면 자동으로 로드
function autoLoadAIForecastIfNeeded() {
  if (isAIForecastLoaded() && !aiForecastCurrentlyLoaded) {
    const cachedHTML = getCachedAIForecastHTML();
    if (cachedHTML) {
      const container = document.getElementById('ai-forecast-container');
      if (container) {
        container.innerHTML = cachedHTML;
        aiForecastCurrentlyLoaded = true;
        lastLoadedAIForecastHTML = cachedHTML; // ✅ 메모리에도 캐시 (탭 전환 시 사용)
        restoreForecastStates(); // 접기/펼치기 상태 복원
      }
    } else {
      // 캐시가 없으면 새로 로드
      loadAIForecastOnDemand();
    }
  }
}

// 버튼 클릭 시 AI 전망 로드
async function loadAIForecastOnDemand() {
  const container = document.getElementById('ai-forecast-container');
  if (!container) return;
  
  // 이미 로드했으면 다시 로드하지 않음 (CRITICAL: 중복 호출 방지)
  if (aiForecastCurrentlyLoaded) {
    console.log('[loadAIForecastOnDemand] Already loaded, skipping');
    return;
  }
  
  console.log('[loadAIForecastOnDemand] Loading AI forecast...');
  aiForecastCurrentlyLoaded = true;
  
  // 로딩 표시
  container.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
      <p style="margin-top: 1rem; color: #94a3b8;">${t('aiForecastAnalyzing')}</p>
    </div>
  `;
  
  const forecastHTML = await loadAIForecast();
  
  // CRITICAL: innerHTML 할당 전에 기존 HTML 완전히 제거
  container.innerHTML = '';
  container.innerHTML = forecastHTML;
  
  // HTML을 메모리와 localStorage에 캐시
  lastLoadedAIForecastHTML = forecastHTML; // ✅ 메모리에 캐시 (탭 전환 시 사용)
  saveAIForecastHTML(forecastHTML);
  setAIForecastLoaded(true);
  
  console.log('[loadAIForecastOnDemand] AI forecast loaded and cached successfully');
}

// AI 전망 로드
async function loadAIForecast() {
  try {
    const response = await axios.get(`/api/ai-forecast?lang=${currentLang}`);
    const data = response.data;
    
    if (data.error || !data.forecasts || data.forecasts.length === 0) {
      return '';
    }
    
    let forecastHTML = `
      <div class="ai-forecast-card">
        <h3 class="text-xl font-bold mb-3">
          🤖 ${t('aiForecastTitle')}
          <span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal; margin-left: 0.5rem;">
            (${t('aiForecastSubtitle')})
          </span>
        </h3>
        <div class="forecast-grid">
    `;
    
    data.forecasts.forEach((forecast, index) => {
      // 다국어 전망 매핑 (GPT-5.2가 각 언어로 응답)
      const outlookMap = {
        // 한국어
        '상승': t('outlookBullish'),
        '하락': t('outlookBearish'),
        '중립': t('outlookNeutral'),
        // English
        'Bullish': t('outlookBullish'),
        'Bearish': t('outlookBearish'),
        'Neutral': t('outlookNeutral'),
        // Français
        'Haussier': t('outlookBullish'),
        'Baissier': t('outlookBearish'),
        'Neutre': t('outlookNeutral'),
        // Deutsch
        'Bullisch': t('outlookBullish'),
        'Bärisch': t('outlookBearish'),
        // Español
        'Alcista': t('outlookBullish'),
        'Bajista': t('outlookBearish')
      };
      const outlookText = outlookMap[forecast.analysis.outlook] || forecast.analysis.outlook;
      
      // 전망에 따른 색상 (원본 값 기준)
      const isPositive = ['상승', 'Bullish', 'Haussier', 'Bullisch', 'Alcista'].includes(forecast.analysis.outlook);
      const isNegative = ['하락', 'Bearish', 'Baissier', 'Bärisch', 'Bajista'].includes(forecast.analysis.outlook);
      
      const outlookColor = isPositive ? 'text-green-400' : 
                          isNegative ? 'text-red-400' : 'text-yellow-400';
      const outlookIcon = isPositive ? 'fa-arrow-trend-up' : 
                         isNegative ? 'fa-arrow-trend-down' : 'fa-minus';
      const changeColor = forecast.change24h >= 0 ? 'text-green-400' : 'text-red-400';
      
      // 텍스트 길이 제한 (3줄 기준 약 150자)
      const MAX_LENGTH = 150;
      const reasoning = forecast.analysis.reasoning || '';
      const advice = forecast.analysis.advice || '';
      
      // HTML 속성 안전 처리 (따옴표, 특수문자 등)
      const escapeHtml = (text) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, ' ')
          .replace(/\r/g, '');
      };
      
      const reasoningEscaped = escapeHtml(reasoning);
      const adviceEscaped = escapeHtml(advice);
      
      const reasoningShort = reasoning.length > MAX_LENGTH ? reasoning.substring(0, MAX_LENGTH) + '...' : reasoning;
      const adviceShort = advice.length > MAX_LENGTH ? advice.substring(0, MAX_LENGTH) + '...' : advice;
      
      const needsReadMore = reasoning.length > MAX_LENGTH || advice.length > MAX_LENGTH;
      // CRITICAL: Use coinId + index to ensure unique IDs even after tab switches
      const forecastId = `forecast-${forecast.coinId}-${index}`;
      
      forecastHTML += `
        <div class="forecast-item">
          <div class="forecast-header">
            <div class="forecast-coin-name">
              <strong>${forecast.symbol}</strong>
              <span class="forecast-coin-fullname">${forecast.name}</span>
            </div>
            <div class="forecast-outlook ${outlookColor}">
              <i class="fas ${outlookIcon}"></i>
              ${outlookText}
            </div>
          </div>
          <div class="forecast-price-section">
            <div class="forecast-price-label">${t('currentPrice')} (USD):</div>
            <div class="forecast-price-display">
              <span class="forecast-price-value">$${forecast.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span class="forecast-price-change ${changeColor}">
                ${forecast.change24h >= 0 ? '▲' : '▼'} ${Math.abs(forecast.change24h).toFixed(2)}%
              </span>
            </div>
          </div>
          <div class="forecast-confidence-section">
            <div class="forecast-confidence-label">${t('forecastConfidence')}:</div>
            <div class="forecast-confidence-display">
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${forecast.analysis.confidence}%; background: ${forecast.analysis.confidence >= 70 ? '#10b981' : forecast.analysis.confidence >= 50 ? '#f59e0b' : '#ef4444'};"></div>
              </div>
              <span class="confidence-percentage"><strong>${forecast.analysis.confidence}%</strong></span>
            </div>
          </div>
          <div class="forecast-reasoning" id="${forecastId}-reasoning" data-full-text="${reasoningEscaped}" data-expanded="false" style="max-height: 140px; overflow-y: auto;">
            <i class="fas fa-lightbulb" style="color: #f59e0b;"></i>
            <span id="${forecastId}-reasoning-text">${reasoningShort}</span>
          </div>
          <div class="forecast-advice" id="${forecastId}-advice" data-full-text="${adviceEscaped}" data-expanded="false" style="max-height: 120px; overflow-y: auto;">
            <i class="fas fa-hand-point-right" style="color: #3b82f6;"></i>
            <strong>${t('forecastAdvice')}:</strong> <span id="${forecastId}-advice-text">${adviceShort}</span>
          </div>
          ${needsReadMore ? `
          <button class="forecast-read-more" onclick="toggleForecastText('${forecastId}')">
            <span id="${forecastId}-btn-text">${currentLang === 'ko' ? '더보기' : currentLang === 'fr' ? 'Lire la suite' : currentLang === 'de' ? 'Mehr lesen' : currentLang === 'es' ? 'Leer más' : 'Read more'}</span>
            <i id="${forecastId}-btn-icon" class="fas fa-chevron-down"></i>
          </button>
          ` : ''}
        </div>
      `;
    });
    
    forecastHTML += `
        </div>
        <div class="forecast-disclaimer">
          ${t('aiForecastDisclaimer')}
        </div>
      </div>
    `;
    
    return forecastHTML;
  } catch (error) {
    console.error('AI 전망 조회 실패:', error);
    return '';
  }
}

async function loadCryptoNews() {
  try {
    const response = await axios.get('/api/news');
    const data = response.data;
    
    if (data.error || !data.news || data.news.length === 0) {
      return '';
    }
    
    let newsHTML = `
      <div class="news-feed-card">
        <h3 class="text-xl font-bold mb-3">
          <i class="fas fa-newspaper text-blue-500"></i> 🔥 ${t('cryptoNews')}
        </h3>
        <div class="news-feed">
    `;
    
    // 최대 5개만 표시
    data.news.slice(0, 5).forEach((article, index) => {
      const timeAgo = getTimeAgo(article.pubDate);
      const newsId = `news-${index}`;
      newsHTML += `
        <div class="news-item-wrapper">
          <div class="news-item" id="${newsId}" 
               data-source="${article.source}" 
               data-time="${timeAgo}"
               data-title="${article.title.replace(/"/g, '&quot;')}" 
               data-description="${article.description ? article.description.replace(/"/g, '&quot;') : ''}"
               data-link="${article.link}"
               onclick="openNewsModal('${newsId}')" 
               style="cursor: pointer;">
            <div class="news-header">
              <div class="news-meta">
                <span class="news-source">${article.source}</span>
                <span class="news-time">${timeAgo}</span>
              </div>
            </div>
            <div class="news-title" id="${newsId}-title">${article.title}</div>
            ${article.description ? `<div class="news-description" id="${newsId}-desc">${article.description}<br><br>💬 <span style="color: #3b82f6;">${t('clickForFullArticle')}</span></div>` : `<div class="news-description" style="color: #94a3b8;">💬 ${t('clickToViewArticle')}</div>`}
          </div>
          ${currentLang !== 'en' ? `
          <button class="translate-btn" 
                  data-news-id="${newsId}" 
                  data-original-title="${article.title.replace(/"/g, '&quot;')}" 
                  data-original-desc="${article.description ? article.description.replace(/"/g, '&quot;') : ''}"
                  onclick="translateNewsById(this, event)">
            <i class="fas fa-language"></i> ${t('translate')}
          </button>
          ` : ''}
        </div>
      `;
    });
    
    newsHTML += `
        </div>
      </div>
    `;
    
    return newsHTML;
  } catch (error) {
    console.error('뉴스 조회 실패:', error);
    return '';
  }
}

// 뉴스 번역 (data 속성에서 읽기)
async function translateNewsById(btn, event) {
  event.preventDefault();
  event.stopPropagation();
  
  const newsId = btn.dataset.newsId;
  const originalTitle = btn.dataset.originalTitle;
  const originalDesc = btn.dataset.originalDesc;
  
  const titleEl = document.getElementById(`${newsId}-title`);
  const descEl = document.getElementById(`${newsId}-desc`);
  
  // 이미 번역된 경우 원문으로 되돌리기
  if (newsTranslations[newsId]) {
    titleEl.textContent = originalTitle;
    if (descEl && originalDesc) descEl.textContent = originalDesc;
    btn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    delete newsTranslations[newsId];
    return;
  }
  
  try {
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('translating')}`;
    btn.disabled = true;
    
    // MyMemory API로 번역 (무료, API Key 불필요)
    const translateText = async (text) => {
      if (!text) return '';
      const targetLang = currentLang === 'ko' ? 'ko' : currentLang === 'fr' ? 'fr' : currentLang === 'de' ? 'de' : currentLang === 'es' ? 'es' : 'en';
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();
      return data.responseData.translatedText;
    };
    
    const translatedTitle = await translateText(originalTitle);
    const translatedDesc = originalDesc ? await translateText(originalDesc) : '';
    
    // 번역 결과 표시
    titleEl.textContent = translatedTitle;
    if (descEl && translatedDesc) descEl.textContent = translatedDesc;
    
    // 번역 캐시 저장
    newsTranslations[newsId] = {
      title: translatedTitle,
      description: translatedDesc
    };
    
    btn.innerHTML = `<i class="fas fa-globe"></i> ${t('original')}`;
    btn.disabled = false;
  } catch (error) {
    console.error('번역 실패:', error);
    btn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    btn.disabled = false;
    alert(t('translationError'));
  }
}

// 뉴스 번역 (MyMemory Translation API - 무료!)
async function translateNews(newsId, originalTitle, originalDesc, event) {
  event.preventDefault();
  event.stopPropagation();
  
  const titleEl = document.getElementById(`${newsId}-title`);
  const descEl = document.getElementById(`${newsId}-desc`);
  const btn = event.currentTarget;
  
  // 이미 번역된 경우 원문으로 되돌리기
  if (newsTranslations[newsId]) {
    titleEl.textContent = originalTitle;
    if (descEl) descEl.textContent = originalDesc;
    btn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    delete newsTranslations[newsId];
    return;
  }
  
  try {
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('translating')}`;
    btn.disabled = true;
    
    // MyMemory API로 번역 (무료, API Key 불필요)
    const translateText = async (text) => {
      if (!text) return '';
      const targetLang = currentLang === 'ko' ? 'ko' : currentLang === 'fr' ? 'fr' : currentLang === 'de' ? 'de' : currentLang === 'es' ? 'es' : 'en';
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();
      return data.responseData.translatedText;
    };
    
    const translatedTitle = await translateText(originalTitle);
    const translatedDesc = originalDesc ? await translateText(originalDesc) : '';
    
    // 번역 결과 표시
    titleEl.textContent = translatedTitle;
    if (descEl && translatedDesc) descEl.textContent = translatedDesc;
    
    // 번역 캐시 저장
    newsTranslations[newsId] = {
      title: translatedTitle,
      description: translatedDesc
    };
    
    btn.innerHTML = `<i class="fas fa-globe"></i> ${t('original')}`;
    btn.disabled = false;
  } catch (error) {
    console.error('번역 실패:', error);
    btn.innerHTML = `<i class="fas fa-language"></i> ${t('translate')}`;
    btn.disabled = false;
    alert(t('translationError'));
  }
}

// 시간차 계산
function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

// 정렬 상태 저장
let currentSort = 'default'; // default, price_high, price_low, change_high, change_low, marketcap, kimchi, profit

// 즐겨찾기 상태 (localStorage)
let favoriteCoins = [];

// 즐겨찾기 로드
function loadFavorites() {
  const stored = localStorage.getItem('favoriteCoins');
  favoriteCoins = stored ? JSON.parse(stored) : [];
}

// 즐겨찾기 저장
function saveFavorites() {
  localStorage.setItem('favoriteCoins', JSON.stringify(favoriteCoins));
}

// 즐겨찾기 토글
function toggleFavorite(coinId) {
  const index = favoriteCoins.indexOf(coinId);
  if (index > -1) {
    favoriteCoins.splice(index, 1);
  } else {
    favoriteCoins.push(coinId);
  }
  saveFavorites();
  loadPrices(); // 재로드
}

// 암호화폐 가격 로드
async function loadPrices() {
  const appDiv = document.getElementById('app');
  
  try {
    appDiv.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> ${t('loading')}</div>`;
    
    // 선택한 코인들을 쿼리 파라미터로 전송
    const coinsParam = selectedCoins.join(',');
    const response = await axios.get(`/api/prices?coins=${coinsParam}`);
    const prices = response.data;
    
    // 에러 체크
    if (prices.error) {
      throw new Error(prices.message || '가격 정보를 가져올 수 없습니다.');
    }
    
    // 공포탐욕지수 가져오기
    const fearGreedHTML = await loadFearGreedIndex();
    
    // AI 전망 컨테이너 (이미 로드된 경우 유지, 아니면 버튼 표시)
    let aiForecastHTML = '';
    if (aiForecastCurrentlyLoaded && lastLoadedAIForecastHTML) {
      // 이미 로드된 AI 전망이 있으면 그대로 사용
      console.log('[loadPrices] Restoring previously loaded AI forecast');
      aiForecastHTML = lastLoadedAIForecastHTML;
    } else {
      // 아직 로드 안 됨 - 버튼만 표시
      aiForecastHTML = `
        <div id="ai-forecast-container" style="min-height: 200px;">
          <div style="text-align: center; padding: 3rem;">
            <button 
              id="loadAIForecastBtn" 
              onclick="if (!aiForecastCurrentlyLoaded) { loadAIForecastOnDemand(); this.disabled = true; }" 
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem 2rem;
                border: none;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.6)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)'"
            >
              <i class="fas fa-robot" style="font-size: 1.2rem;"></i>
              <span>${t('loadAIForecast')}</span>
            </button>
            <p style="margin-top: 1rem; color: #94a3b8; font-size: 0.9rem;">
              <i class="fas fa-info-circle"></i> ${t('aiForecastClickMsg')}
            </p>
          </div>
        </div>
      `;
    }
    
    // 암호화폐 뉴스 가져오기
    const newsHTML = await loadCryptoNews();
    
    // 검색 및 코인 추가 UI
    const searchHTML = `
      <div class="coin-search-section">
        <h3 class="text-xl font-bold mb-3">
          <i class="fas fa-search"></i> ${t('searchTitle')}
        </h3>
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              id="coinSearchInput" 
              class="search-input" 
              placeholder="${t('searchPlaceholder')}"
              oninput="searchCoins(this.value)"
            />
          </div>
        </div>
        <div id="searchResults"></div>
        
        <!-- Top 100 코인 브라우저 버튼 -->
        <div style="margin-top: 1rem;">
          <button class="btn-primary" onclick="openCoinBrowser()" style="width: 100%; padding: 0.75rem; font-size: 1rem;">
            <i class="fas fa-list"></i> ${t('browseTop100') || 'Top 100 코인 보기'}
          </button>
        </div>
        
        <!-- 정렬 버튼 -->
        <div class="sort-section">
          <h4 class="text-sm font-bold mb-2 text-gray-400">
            <i class="fas fa-sort"></i> ${t('sortTitle')}
          </h4>
          <div class="sort-buttons">
            <button class="sort-btn ${currentSort === 'default' ? 'active' : ''}" onclick="setSortOrder('default')">
              <i class="fas fa-th"></i> ${t('sortDefault')}
            </button>
            <button class="sort-btn ${currentSort === 'price_high' ? 'active' : ''}" onclick="setSortOrder('price_high')">
              <i class="fas fa-arrow-up"></i> ${t('sortPriceHigh')}
            </button>
            <button class="sort-btn ${currentSort === 'price_low' ? 'active' : ''}" onclick="setSortOrder('price_low')">
              <i class="fas fa-arrow-down"></i> ${t('sortPriceLow')}
            </button>
            <button class="sort-btn ${currentSort === 'change_high' ? 'active' : ''}" onclick="setSortOrder('change_high')">
              <i class="fas fa-chart-line"></i> ${t('sortChangeHigh')}
            </button>
            <button class="sort-btn ${currentSort === 'change_low' ? 'active' : ''}" onclick="setSortOrder('change_low')">
              <i class="fas fa-chart-line"></i> ${t('sortChangeLow')}
            </button>
            <button class="sort-btn ${currentSort === 'marketcap' ? 'active' : ''}" onclick="setSortOrder('marketcap')">
              <i class="fas fa-chart-pie"></i> ${t('sortMarketCap')}
            </button>
            <button class="sort-btn ${currentSort === 'favorite' ? 'active' : ''}" onclick="setSortOrder('favorite')">
              <i class="fas fa-star"></i> ${t('sortFavorite')}
            </button>
          </div>
        </div>
      </div>
    `;
    
    // 통계 섹션
    let statsHTML = `
      <div class="stats-grid">
        ${fearGreedHTML}
        <div class="stat-card">
          <h3 class="text-xl font-bold mb-2">
            <i class="fas fa-coins text-yellow-500"></i> ${t('selectedCoins')}
          </h3>
          <div class="text-3xl font-bold">${Object.keys(prices).length}</div>
        </div>
        <div class="stat-card">
          <h3 class="text-xl font-bold mb-2">
            <i class="fas fa-chart-line text-blue-500"></i> ${t('realTimeUpdate')}
          </h3>
          <div class="text-lg">${new Date().toLocaleTimeString(currentLang === 'ko' ? 'ko-KR' : 'en-US')}</div>
        </div>
      </div>
    `;
    
    // 포트폴리오 요약 계산
    let totalInvestment = 0;
    let totalCurrentValue = 0;
    let hasPortfolio = false;
    
    for (const [coinId, data] of Object.entries(prices)) {
      if (portfolio[coinId]) {
        hasPortfolio = true;
        const { amount, avgPrice } = portfolio[coinId];
        const safeAmount = Number(amount) || 0;
        const safeAvgPrice = Number(avgPrice) || 0;
        totalInvestment += safeAmount * safeAvgPrice;
        totalCurrentValue += safeAmount * (data.usd || 0);
      }
    }
    
    const totalProfit = totalCurrentValue - totalInvestment;
    const totalProfitRate = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0.00';
    
    // 포트폴리오 요약 카드 (포트폴리오가 있을 때만 표시)
    let portfolioSummaryHTML = '';
    if (hasPortfolio) {
      const isProfitable = totalProfit >= 0;
      portfolioSummaryHTML = `
        <div class="portfolio-summary-card">
          <h3 class="text-xl font-bold mb-3">
            <i class="fas fa-wallet text-purple-500"></i> ${t('portfolioSummary')}
          </h3>
          <div class="portfolio-stats">
            <div class="portfolio-stat">
              <span class="stat-label">${t('totalInvestment')}</span>
              <span class="stat-value">${formatPrice(totalInvestment)}</span>
            </div>
            <div class="portfolio-stat">
              <span class="stat-label">${t('currentValue')}</span>
              <span class="stat-value">${formatPrice(totalCurrentValue)}</span>
            </div>
            <div class="portfolio-stat ${isProfitable ? 'text-green-400' : 'text-red-400'}">
              <span class="stat-label">${t('profitLoss')}</span>
              <span class="stat-value"><strong>${formatPrice(totalProfit)}</strong></span>
            </div>
            <div class="portfolio-stat ${isProfitable ? 'text-green-400' : 'text-red-400'}">
              <span class="stat-label">${t('profitRate')}</span>
              <span class="stat-value"><strong>${totalProfit >= 0 ? '+' : ''}${totalProfitRate}%</strong></span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 코인 카드들
    let coinsHTML = '<div class="coin-grid">';
    
    // 각 코인의 김치 프리미엄을 비동기로 가져오기 (한국어일 때만)
    let coinKimchiMap = {};
    if (currentLang === 'ko') {
      const coinKimchiPromises = Object.keys(prices).map(async (coinId) => {
        const exchanges = ['upbit', 'bithumb', 'coinone'];
        const results = await Promise.all(
          exchanges.map(async (exchange) => {
            try {
              const response = await axios.get(`/api/kimchi-premium/${coinId}?exchange=${exchange}`);
              return { exchange, data: response.data };
            } catch (error) {
              return { exchange, data: null };
            }
          })
        );
        return { coinId, results };
      });
      
      const coinKimchiResults = await Promise.all(coinKimchiPromises);
      coinKimchiResults.forEach(result => {
        coinKimchiMap[result.coinId] = result.results;
      });
    }
    
    // 코인 데이터를 배열로 변환 (정렬을 위해)
    const coinsArray = Object.entries(prices).map(([coinId, data]) => {
      const change = data.usd_24h_change || 0;
      const marketCapKRW = data.krw_market_cap || 0;
      const volume24h = data.usd_24h_vol || 0;
      const kimchiResults = coinKimchiMap[coinId];
      
      // 평균 김치 프리미엄 계산
      let avgKimchi = 0;
      if (kimchiResults && kimchiResults.length > 0) {
        const validKimchi = kimchiResults.filter(r => r.data && !r.data.error && r.data.premium);
        if (validKimchi.length > 0) {
          avgKimchi = validKimchi.reduce((sum, r) => sum + r.data.premium, 0) / validKimchi.length;
        }
      }
      
      // 포트폴리오 수익률 계산
      let profitRate = 0;
      if (portfolio[coinId]) {
        const { amount, avgPrice } = portfolio[coinId];
        const currentValue = amount * data.usd;
        const profit = currentValue - (amount * avgPrice);
        profitRate = ((profit / (amount * avgPrice)) * 100);
      }
      
      return {
        coinId,
        data,
        change,
        marketCapKRW,
        volume24h,
        kimchiResults,
        avgKimchi,
        profitRate,
        hasPortfolio: !!portfolio[coinId],
        isFavorite: favoriteCoins.includes(coinId)
      };
    });
    
    // 정렬 적용
    coinsArray.sort((a, b) => {
      switch(currentSort) {
        case 'favorite':
          // 즐겨찾기 먼저, 그 다음 기본 순서
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return 0;
        case 'price_high':
          return b.data.usd - a.data.usd;
        case 'price_low':
          return a.data.usd - b.data.usd;
        case 'change_high':
          return b.change - a.change;
        case 'change_low':
          return a.change - b.change;
        case 'marketcap':
          return b.marketCapKRW - a.marketCapKRW;
        case 'kimchi':
          return b.avgKimchi - a.avgKimchi;
        case 'profit':
          return b.profitRate - a.profitRate;
        default: // 'default'
          return 0; // 원래 순서 유지
      }
    });
    
    // 코인 카드 렌더링
    for (const coinData of coinsArray) {
      const { coinId, data, change, marketCapKRW, volume24h, kimchiResults: coinKimchiResults, isFavorite } = coinData;
      
      // 코인 이름 (캐시에서 찾기)
      let coinName = coinId.charAt(0).toUpperCase() + coinId.slice(1);
      let coinSymbol = coinId.toUpperCase();
      
      // 김치 프리미엄 정보 (한국어일 때만 표시)
      let kimchiPremiumHTML = '';
      if (currentLang === 'ko' && coinKimchiResults && coinKimchiResults.length > 0) {
        const validResults = coinKimchiResults.filter(r => r.data && !r.data.error);
        if (validResults.length > 0) {
          kimchiPremiumHTML = '<div class="kimchi-premium-container">';
          kimchiPremiumHTML += '<div>💰 김치 프리미엄</div>';
          kimchiPremiumHTML += '<div class="kimchi-premium-badges">';
          validResults.forEach(result => {
            const isPremium = result.data.premium >= 0;
            const premiumColor = isPremium ? 'text-green-400' : 'text-red-400';
            const exchangeName = result.exchange === 'upbit' ? '업비트' : 
                                result.exchange === 'bithumb' ? '빗썸' : '코인원';
            kimchiPremiumHTML += `
              <span class="kimchi-premium-badge ${isPremium ? 'premium' : 'discount'}">
                ${exchangeName}: <strong class="${premiumColor}">${result.data.premium > 0 ? '+' : ''}${result.data.premium}%</strong>
              </span>
            `;
          });
          kimchiPremiumHTML += '</div></div>';
        }
      }
      
      // 포트폴리오 정보
      let portfolioHTML = '';
      if (portfolio[coinId]) {
        const { amount, avgPrice } = portfolio[coinId];
        const safeAmount = Number(amount) || 0;
        const safeAvgPrice = Number(avgPrice) || 0;
        const currentValue = safeAmount * data.usd;
        const profit = currentValue - (safeAmount * safeAvgPrice);
        const profitRate = safeAvgPrice > 0 ? ((profit / (safeAmount * safeAvgPrice)) * 100).toFixed(2) : '0.00';
        const isProfitable = profit >= 0;
        
        portfolioHTML = `
          <div class="portfolio-info ${isProfitable ? 'profitable' : 'losing'}">
            <div class="portfolio-detail">
              <i class="fas fa-coins"></i> ${t('holding')}: ${safeAmount.toFixed(4)} ${coinSymbol}
            </div>
            <div class="portfolio-detail">
              <i class="fas fa-dollar-sign"></i> ${t('avgPrice')}: ${formatPrice(safeAvgPrice)}
            </div>
            <div class="portfolio-detail ${isProfitable ? 'text-green-400' : 'text-red-400'}">
              <strong>${profit >= 0 ? '+' : ''}${profitRate}%</strong> (${formatPrice(profit)})
            </div>
          </div>
        `;
      }
      
      coinsHTML += `
        <div class="coin-card ${isFavorite ? 'favorite-coin' : ''}">
          <div class="coin-header">
            <div class="coin-name">
              <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${coinId}')" title="${isFavorite ? t('removeFromFavorites') : t('addToFavorites')}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-star"></i>
              </button>
              ${coinName} (${coinSymbol})
            </div>
            <button class="remove-coin-btn" onclick="toggleCoin('${coinId}')" title="${t('removeCoin')}">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="coin-price">
            ${currentLang === 'ko' ? formatPrice(data.krw, 'krw') : formatPrice(data.usd, 'usd')}
          </div>
          <div class="coin-price-sub">
            ${currentLang === 'ko' ? formatPrice(data.usd, 'usd') : ''}
          </div>
          ${getPriceChangeHTML(change)}
          ${kimchiPremiumHTML}
          <div class="market-cap">
            <i class="fas fa-chart-pie"></i> ${t('marketCap')}: ${formatMarketCap(currentLang === 'ko' ? marketCapKRW : data.market_cap, currentLang === 'ko' ? 'krw' : 'usd')}
          </div>
          <div class="volume-info">
            <i class="fas fa-exchange-alt"></i> ${t('volume24h')}: ${formatMarketCap(volume24h, 'usd')}
          </div>
          <div class="exchange-price-info" id="exchange-${coinId}" style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem;">
            <i class="fas fa-building"></i> ${t('localExchange')}: <span style="color: #3b82f6;">Loading...</span>
          </div>
          ${portfolioHTML}
          <div class="coin-actions">
            <button class="action-btn" onclick="openChartModal('${coinId}', '${coinName}')">
              <i class="fas fa-chart-line"></i> ${t('chart')}
            </button>
            <button class="action-btn" onclick="openPortfolioModal('${coinId}', '${coinName}', ${data.usd})">
              <i class="fas fa-wallet"></i> ${t('portfolio')}
            </button>
          </div>
        </div>
      `;
    }
    
    coinsHTML += '</div>';
    
    // 🖼️ 광고 영역 2: 중단 배너 (모바일/데스크톱 분리)
    const adMiddleHTML = `
      <!-- 데스크톱 광고 -->
      <div class="ad-container ad-middle ad-desktop" style="margin-top: 2rem; margin-bottom: 2rem;">
        <div id="frame" style="width: 100%; margin: auto; position: relative; z-index: 99998;">
          <iframe 
            data-aa='2421975' 
            src='//acceptable.a-ads.com/2421975/?size=Adaptive'
            style='border:0; padding:0; width:70%; height:auto; overflow:hidden; display: block; margin: auto'>
          </iframe>
        </div>
      </div>
      
      <!-- 모바일 광고 (작은 배너 또는 숨김) -->
      <div class="ad-container ad-middle ad-mobile" style="margin-top: 1rem; margin-bottom: 1rem; display: none;">
        <div style="text-align: center; padding: 1rem; color: #94a3b8; font-size: 0.85rem;">
          <!-- 모바일에서는 광고 최소화 -->
        </div>
      </div>
    `;
    
    const adBottomHTML = `
      <div class="ad-container ad-bottom" style="margin-top: 2rem; margin-bottom: 3rem;">
        <div id="frame" style="width: 100%; margin: auto; position: relative; z-index: 99998;">
          <iframe 
            data-aa='2421980' 
            src='//acceptable.a-ads.com/2421980/?size=Adaptive'
            style='border:0; padding:0; width:70%; height:auto; overflow:hidden; display: block; margin: auto'>
          </iframe>
        </div>
      </div>
    `;
    
    // 새로고침 버튼 (가운데 정렬)
    const refreshButton = `
      <div style="text-align: center !important; padding: 0 1rem; margin: 2rem 0;">
        <button class="refresh-btn" onclick="loadPrices()" style="margin: 0 auto !important; display: inline-block !important;">
          <i class="fas fa-sync-alt"></i> ${t('refresh')}
        </button>
      </div>
    `;
    
    // 순서: 검색 → 통계 → 포트폴리오 요약 → 코인 목록 → 중간 광고 → AI 전망 → 뉴스 → 새로고침 → 하단 광고
    appDiv.innerHTML = searchHTML + statsHTML + portfolioSummaryHTML + coinsHTML + adMiddleHTML + aiForecastHTML + newsHTML + refreshButton + adBottomHTML;
    
    // 🌍 각 코인별로 해당 국가 거래소 가격 로드
    loadExchangePrices(coinsArray);
    
  } catch (error) {
    console.error('가격 정보 로드 실패:', error);
    appDiv.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i> 
        ${t('errorLoadingPrices')}<br>
        <small>${error.message}</small><br>
        <small>${t('pleaseRetry')}</small>
      </div>
      <button class="refresh-btn" onclick="loadPrices()">
        <i class="fas fa-sync-alt"></i> ${t('retry')}
      </button>
    `;
  }
}

// 🌍 국가별 거래소 가격 로드
async function loadExchangePrices(coinsData) {
  const country = countryMapping[currentLang] || 'us';
  
  // 한국어는 이미 김치 프리미엄으로 표시하므로 스킵
  if (country === 'kr') {
    for (const coinData of coinsData) {
      const { coinId } = coinData;
      const exchangeEl = document.getElementById(`exchange-${coinId}`);
      if (exchangeEl) {
        exchangeEl.style.display = 'none'; // 한국은 김치 프리미엄으로 대체
      }
    }
    return;
  }
  
  for (const coinData of coinsData) {
    const { coinId } = coinData;
    const coinSymbol = coinSymbolMap[coinId];
    
    if (!coinSymbol) continue;
    
    const exchangeEl = document.getElementById(`exchange-${coinId}`);
    if (!exchangeEl) continue;
    
    try {
      const response = await axios.get(`/api/exchange-prices/${coinSymbol}?country=${country}`);
      const data = response.data;
      
      if (data.price) {
        let formattedPrice = '';
        if (data.currency === 'USD') {
          formattedPrice = `$${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (data.currency === 'EUR') {
          formattedPrice = `€${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (data.currency === 'KRW') {
          formattedPrice = `₩${data.price.toLocaleString('ko-KR', { minimumFractionDigits: 0 })}`;
        }
        
        exchangeEl.innerHTML = `<i class="fas fa-building"></i> ${t('localExchange')}: <span style="color: #3b82f6;">${formattedPrice}</span> <small style="color: #64748b;">(${data.exchangeName})</small>`;
      } else {
        exchangeEl.innerHTML = `<i class="fas fa-building"></i> ${t('localExchange')}: <span style="color: #9ca3af;">N/A</span>`;
      }
    } catch (error) {
      console.error(`거래소 가격 로드 실패 (${coinId}):`, error);
      exchangeEl.innerHTML = `<i class="fas fa-building"></i> ${t('localExchange')}: <span style="color: #9ca3af;">N/A</span>`;
    }
  }
}

// 자동 새로고침 (30초마다 - 최적화)
let autoRefreshInterval;

function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  autoRefreshInterval = setInterval(() => {
    loadPrices();
  }, 30000); // 30초 (10초 → 30초)
}

// 정렬 순서 변경
function setSortOrder(sortType) {
  currentSort = sortType;
  loadPrices(); // 재로드하여 정렬 적용
}

// 페이지 이탈 시 인터벌 정리
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  const coinBrowserModal = document.getElementById('coinBrowserModal');
  const chartModal = document.getElementById('chartModal');
  const portfolioModal = document.getElementById('portfolioModal');
  const userGuideModal = document.getElementById('userGuideModal');
  
  if (event.target === coinBrowserModal) {
    closeCoinBrowser();
  }
  if (event.target === chartModal) {
    closeChartModal();
  }
  if (event.target === portfolioModal) {
    closePortfolioModal();
  }
  if (event.target === userGuideModal) {
    closeUserGuide();
  }
}

// ===========================================
// 📖 사용설명서 위젯 (User Guide Widget)
// ===========================================

// 사용설명서 모달 열기
function openUserGuide() {
  const modal = document.getElementById('userGuideModal');
  if (modal) {
    modal.style.display = 'flex';
    // 스크롤을 맨 위로
    const content = document.getElementById('userGuideContent');
    if (content) {
      content.scrollTop = 0;
    }
  }
}

// 사용설명서 모달 닫기
function closeUserGuide() {
  const modal = document.getElementById('userGuideModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ===========================================
// 📈 AI 전망 더보기/접기 기능
// ===========================================

// 각 전망 카드의 펼침/접힘 상태 저장
function saveForecastState(forecastId, isExpanded) {
  try {
    const states = JSON.parse(localStorage.getItem('forecastStates') || '{}');
    states[forecastId] = isExpanded;
    localStorage.setItem('forecastStates', JSON.stringify(states));
  } catch (e) {
    console.error('Failed to save forecast state:', e);
  }
}

// 전망 카드의 상태 불러오기
function getForecastState(forecastId) {
  try {
    const states = JSON.parse(localStorage.getItem('forecastStates') || '{}');
    return states[forecastId] || false;
  } catch (e) {
    console.error('Failed to get forecast state:', e);
    return false;
  }
}

// 페이지 로드 후 모든 전망 카드의 상태 복원
function restoreForecastStates() {
  // HTML 엔티티 디코딩 함수
  const decodeHtml = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };
  
  // 잠시 후 DOM이 준비될 때까지 기다림
  setTimeout(() => {
    try {
      const states = JSON.parse(localStorage.getItem('forecastStates') || '{}');
      
      Object.keys(states).forEach(forecastId => {
        if (states[forecastId]) {
          // 펼쳐진 상태였다면 다시 펼치기
          const reasoningDiv = document.getElementById(`${forecastId}-reasoning`);
          const adviceDiv = document.getElementById(`${forecastId}-advice`);
          
          if (reasoningDiv && adviceDiv) {
            const reasoningText = document.getElementById(`${forecastId}-reasoning-text`);
            const adviceText = document.getElementById(`${forecastId}-advice-text`);
            const btnText = document.getElementById(`${forecastId}-btn-text`);
            const btnIcon = document.getElementById(`${forecastId}-btn-icon`);
            
            if (reasoningText && adviceText && btnText && btnIcon) {
              // 전체 텍스트 표시 (HTML 엔티티 디코딩)
              reasoningText.textContent = decodeHtml(reasoningDiv.dataset.fullText || '');
              adviceText.textContent = decodeHtml(adviceDiv.dataset.fullText || '');
              
              // 스타일 적용
              reasoningDiv.style.maxHeight = 'none';
              reasoningDiv.style.overflowY = 'visible';
              adviceDiv.style.maxHeight = 'none';
              adviceDiv.style.overflowY = 'visible';
              
              reasoningDiv.dataset.expanded = 'true';
              adviceDiv.dataset.expanded = 'true';
              
              btnText.textContent = currentLang === 'ko' ? '접기' : currentLang === 'fr' ? 'Réduire' : currentLang === 'de' ? 'Einklappen' : currentLang === 'es' ? 'Ocultar' : 'Show less';
              btnIcon.className = 'fas fa-chevron-up';
            }
          }
        }
      });
    } catch (e) {
      console.error('Failed to restore forecast states:', e);
    }
  }, 100);
}

// AI 전망 텍스트 펼치기/접기
function toggleForecastText(forecastId) {
  console.log('[toggleForecastText] Called with forecastId:', forecastId);
  
  const reasoningDiv = document.getElementById(`${forecastId}-reasoning`);
  const adviceDiv = document.getElementById(`${forecastId}-advice`);
  const reasoningText = document.getElementById(`${forecastId}-reasoning-text`);
  const adviceText = document.getElementById(`${forecastId}-advice-text`);
  const btnText = document.getElementById(`${forecastId}-btn-text`);
  const btnIcon = document.getElementById(`${forecastId}-btn-icon`);
  
  // CRITICAL: 디버깅 로그 추가
  console.log('[toggleForecastText] Found elements:', {
    reasoningDiv: reasoningDiv?.id,
    adviceDiv: adviceDiv?.id,
    reasoningText: reasoningText?.id,
    adviceText: adviceText?.id
  });
  
  // null 체크 (탭 전환 후에도 작동하도록)
  if (!reasoningDiv || !adviceDiv || !reasoningText || !adviceText || !btnText || !btnIcon) {
    console.error('[toggleForecastText] Forecast elements not found:', forecastId);
    return;
  }
  
  // HTML 엔티티 디코딩 함수
  const decodeHtml = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };
  
  const isExpanded = reasoningDiv.dataset.expanded === 'true';
  console.log('[toggleForecastText] Current state - isExpanded:', isExpanded);
  
  const MAX_LENGTH = 150;
  
  if (isExpanded) {
    // 접기 - 인라인 스타일로 이 요소만 제어
    console.log('[toggleForecastText] Collapsing:', forecastId);
    const reasoningFull = decodeHtml(reasoningDiv.dataset.fullText || '');
    const adviceFull = decodeHtml(adviceDiv.dataset.fullText || '');
    
    reasoningText.textContent = reasoningFull.length > MAX_LENGTH ? reasoningFull.substring(0, MAX_LENGTH) + '...' : reasoningFull;
    adviceText.textContent = adviceFull.length > MAX_LENGTH ? adviceFull.substring(0, MAX_LENGTH) + '...' : adviceFull;
    
    // CRITICAL: 인라인 스타일로 이 항목만 제어
    reasoningDiv.style.maxHeight = '140px';
    reasoningDiv.style.overflowY = 'auto';
    adviceDiv.style.maxHeight = '120px';
    adviceDiv.style.overflowY = 'auto';
    
    reasoningDiv.dataset.expanded = 'false';
    adviceDiv.dataset.expanded = 'false';
    
    btnText.textContent = currentLang === 'ko' ? '더보기' : currentLang === 'fr' ? 'Lire la suite' : currentLang === 'de' ? 'Mehr lesen' : currentLang === 'es' ? 'Leer más' : 'Read more';
    btnIcon.className = 'fas fa-chevron-down';
    
    // 상태 저장
    saveForecastState(forecastId, false);
  } else {
    // 펼치기 - 인라인 스타일로 이 요소만 제어
    console.log('[toggleForecastText] Expanding:', forecastId);
    const reasoningFull = decodeHtml(reasoningDiv.dataset.fullText || '');
    const adviceFull = decodeHtml(adviceDiv.dataset.fullText || '');
    
    reasoningText.textContent = reasoningFull;
    adviceText.textContent = adviceFull;
    
    // CRITICAL: 인라인 스타일로 이 항목만 제어
    reasoningDiv.style.maxHeight = 'none';
    reasoningDiv.style.overflowY = 'visible';
    adviceDiv.style.maxHeight = 'none';
    adviceDiv.style.overflowY = 'visible';
    
    reasoningDiv.dataset.expanded = 'true';
    adviceDiv.dataset.expanded = 'true';
    
    btnText.textContent = currentLang === 'ko' ? '접기' : currentLang === 'fr' ? 'Réduire' : currentLang === 'de' ? 'Einklappen' : currentLang === 'es' ? 'Ocultar' : 'Show less';
    btnIcon.className = 'fas fa-chevron-up';
    
    // 상태 저장
    saveForecastState(forecastId, true);
  }
  
  console.log('[toggleForecastText] New state - expanded:', reasoningDiv.dataset.expanded);
}
