// 다국어 텍스트
const translations = {
  ko: {
    // 헤더
    title: '암호화폐 실시간 대시보드',
    
    // 네비게이션
    navCoins: '코인 목록',
    navAI: 'AI 전망',
    navNews: '최신 뉴스',
    navBlog: '블로그',
    
    // 통계 카드
    fearGreedIndex: '공포탐욕지수',
    selectedCoins: '선택한 코인',
    realTimeUpdate: '실시간 업데이트',
    advice: {
      extremeFear: '매수 기회!',
      fear: '조심스런 매수',
      neutral: '관망/보유',
      greed: '매도 신호'
    },
    
    // 검색
    searchPlaceholder: '코인 이름 또는 심볼 검색... (예: Bitcoin, ETH, DOGE)',
    searchTitle: '코인 검색 및 추가',
    browseTop100: 'Top 100 코인 보기',
    noSearchResults: '검색 결과가 없습니다.',
    searchError: '검색 중 오류가 발생했습니다.',
    
    // 정렬
    sortTitle: '내 코인 정렬',
    sortDefault: '기본',
    sortPriceHigh: '가격 높은순',
    sortPriceLow: '가격 낮은순',
    sortChangeHigh: '변동률 높은순',
    sortChangeLow: '변동률 낮은순',
    sortMarketCap: '시가총액순',
    sortFavorite: '즐겨찾기',
    
    // 코인 카드
    kimchiPremium: '김치 프리미엄',
    marketCap: '시가총액',
    volume24h: '24h 거래량',
    holding: '보유',
    avgPrice: '평균가',
    chart: '차트',
    portfolio: '포트폴리오',
    addToFavorites: '즐겨찾기 추가',
    removeFromFavorites: '즐겨찾기 해제',
    removeCoin: '제거',
    
    // 포트폴리오
    portfolioSummary: '포트폴리오 요약',
    totalInvestment: '총 투자금액',
    currentValue: '현재 가치',
    profitLoss: '수익/손실',
    profitRate: '수익률',
    portfolioManagement: '포트폴리오 관리',
    portfolioAmountPlaceholder: '예: 0.5',
    portfolioPricePlaceholder: '예: 50000',
    amount: '보유 수량',
    avgBuyPrice: '평균 매수가 (USD)',
    currentPrice: '현재가 (USD)',
    save: '저장',
    cancel: '취소',
    enterAmountAndPrice: '수량과 평균 매수가를 입력하세요.',
    investment: '투자금액',
    profit: '수익',
    loss: '손실',
    
    // 차트
    priceChart: '가격 차트',
    days7: '7일',
    days30: '30일',
    days90: '90일',
    chartLoading: '차트 로딩 중...',
    chartError: '차트를 불러올 수 없습니다.',
    chartErrorCheckConsole: '차트를 불러올 수 없습니다. 콘솔을 확인해주세요.',
    
    // Top 100
    top100Title: 'Top 100 암호화폐',
    top10Title: 'Top 10 암호화폐',
    rank: '순위',
    coin: '코인',
    price: '가격',
    viewAll: '전체 보기',
    close: '닫기',
    selected: '선택됨',
    sortByMarketCap: '시가총액순',
    sortByVolume: '거래량순',
    sortByGainers: '급등순',
    sortByLosers: '급락순',
    
    // 뉴스
    cryptoNews: '암호화폐 최신 뉴스',
    translate: '번역',
    original: '원문',
    viewOriginal: '원문 보기',
    noDescription: '설명이 없습니다.',
    readMore: '더 보기',
    showLess: '접기',
    loadAIForecast: 'AI 전망 보기',
    aiForecastClickMsg: '클릭하면 10개 주요 코인의 AI 분석을 확인할 수 있습니다 (바이낸스 광고 포함)',
    supportAPIMessage: '광고를 시청하시면 API 운영 비용에 큰 도움이 됩니다 💙',
    aiForecastAnalyzing: 'AI가 시장을 분석하고 있습니다...',
    clickForFullArticle: '내용이 더 궁금하시면 클릭하여 전체 기사를 확인하세요!',
    clickToViewArticle: '전체 기사를 보려면 클릭하세요!',
    translating: '번역 중...',
    translationError: '번역 중 오류가 발생했습니다.',
    
    // 버튼
    refresh: '새로고침',
    
    // 에러 메시지
    errorLoadingPrices: '가격 정보를 불러올 수 없습니다.',
    pleaseRetry: '잠시 후 다시 시도해주세요.',
    retry: '다시 시도',
    loading: '데이터 로딩 중...',
    errorLoadingTop100: 'Top 100 코인을 불러올 수 없습니다',
    apiLimitReached: 'CoinGecko API 요청 제한에 도달했습니다.',
    useSearchInstead: '검색 기능을 사용하여 원하는 코인을 추가해주세요.',
    minOneCoinRequired: '최소 1개의 코인은 선택해야 합니다.',
    
    // 광고
    advertisement: 'Advertisement',
    adInquiryTitle: '광고 문의',
    adInquiryDesc: '이 공간에 귀하의 광고를 게재하세요',
    
    // 거래소
    exchangePrice: '거래소 가격',
    localExchange: '한국 거래소',
    priceSpread: '가격 차이',
    
    // 푸터
    contact: '문의',
    
    // 사용설명서 위젯
    userGuideTitle: '사용 설명서',
    
    // AI 전망
    aiForecastTitle: 'AI 코인 전망 분석',
    aiForecastSubtitle: 'AI 기반 1주일 단기 전망',
    forecastOutlook: '전망',
    forecastConfidence: '신뢰도',
    forecastReasoning: '분석',
    forecastAdvice: '조언',
    outlookBullish: '상승',
    outlookBearish: '하락',
    outlookNeutral: '중립',
    aiForecastDisclaimer: '⚠️ AI 분석은 참고용이며 투자 조언이 아닙니다.',
    lastUpdate: '마지막 업데이트',
    
    // 바이낸스 광고
    adModalTitle: 'AI 전망은 바이낸스가 후원합니다',
    adModalSubtitle: '잠시만 기다려주세요...',
    binanceBannerTitle: '전세계 1위 암호화폐 거래소',
    binanceBannerSubtitle: '바이낸스에서 지금 거래하세요!',
    binanceCTA: '지금 가입하고 수수료 20% 할인 받기 →',
    adCountdownText: '초 후 AI 전망이 표시됩니다',
    skipAd: '광고 건너뛰기',
    secondsWait: '초 대기 중...',
    skipAdNow: 'AI 전망 확인하기 →',
    adHelpMessage: '💡 광고 시청은 무료 API 운영에 큰 도움이 됩니다',
    change24h: '24시간 변동',
    thankYou: '감사합니다! 🙏'
  },
  
  en: {
    title: 'Crypto Real-time Dashboard',
    
    // Navigation
    navCoins: 'Coin List',
    navAI: 'AI Forecast',
    navNews: 'Latest News',
    navBlog: 'Blog',
    
    fearGreedIndex: 'Fear & Greed Index',
    selectedCoins: 'Selected Coins',
    realTimeUpdate: 'Real-time Update',
    advice: {
      extremeFear: 'Buy Opportunity!',
      fear: 'Cautious Buy',
      neutral: 'Hold',
      greed: 'Sell Signal'
    },
    
    searchPlaceholder: 'Search coin name or symbol... (e.g. Bitcoin, ETH, DOGE)',
    searchTitle: 'Search and Add Coins',
    browseTop100: 'Browse Top 100 Coins',
    noSearchResults: 'No search results found.',
    searchError: 'An error occurred during search.',
    
    sortTitle: 'Sort My Coins',
    sortDefault: 'Default',
    sortPriceHigh: 'Price High',
    sortPriceLow: 'Price Low',
    sortChangeHigh: 'Change High',
    sortChangeLow: 'Change Low',
    sortMarketCap: 'Market Cap',
    sortFavorite: 'Favorites',
    
    kimchiPremium: 'Kimchi Premium',
    marketCap: 'Market Cap',
    volume24h: '24h Volume',
    holding: 'Holding',
    avgPrice: 'Avg Price',
    chart: 'Chart',
    portfolio: 'Portfolio',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    removeCoin: 'Remove',
    
    portfolioSummary: 'Portfolio Summary',
    totalInvestment: 'Total Investment',
    currentValue: 'Current Value',
    profitLoss: 'Profit/Loss',
    profitRate: 'Profit Rate',
    portfolioManagement: 'Portfolio Management',
    portfolioAmountPlaceholder: 'e.g. 0.5',
    portfolioPricePlaceholder: 'e.g. 50000',
    amount: 'Amount',
    avgBuyPrice: 'Avg. Buy Price (USD)',
    currentPrice: 'Current Price (USD)',
    save: 'Save',
    cancel: 'Cancel',
    enterAmountAndPrice: 'Enter amount and average price.',
    investment: 'Investment',
    profit: 'Profit',
    loss: 'Loss',
    
    priceChart: 'Price Chart',
    days7: '7 days',
    days30: '30 days',
    days90: '90 days',
    chartLoading: 'Loading chart...',
    chartError: 'Unable to load chart.',
    chartErrorCheckConsole: 'Unable to load chart. Please check console.',
    
    top100Title: 'Top 100 Cryptocurrencies',
    top10Title: 'Top 10 Cryptocurrencies',
    rank: 'Rank',
    coin: 'Coin',
    price: 'Price',
    viewAll: 'View All',
    close: 'Close',
    selected: 'Selected',
    sortByMarketCap: 'Market Cap',
    sortByVolume: 'Volume',
    sortByGainers: 'Top Gainers',
    sortByLosers: 'Top Losers',
    
    cryptoNews: 'Crypto Latest News',
    translate: 'Translate',
    original: 'Original',
    viewOriginal: 'View Original',
    noDescription: 'No description available.',
    readMore: 'Read More',
    showLess: 'Show Less',
    loadAIForecast: 'View AI Forecast',
    aiForecastClickMsg: 'Click to see AI analysis of 10 major coins (includes Binance ad)',
    supportAPIMessage: 'Watching ads helps support our free API service 💙',
    adHelpMessage: '💡 Ad views help keep this service free',
    aiForecastAnalyzing: 'AI is analyzing the market...',
    clickForFullArticle: 'Click to read the full article!',
    clickToViewArticle: 'Click to view the full article!',
    translating: 'Translating...',
    translationError: 'Translation error occurred.',
    
    refresh: 'Refresh',
    
    errorLoadingPrices: 'Unable to load price information.',
    pleaseRetry: 'Please try again later.',
    retry: 'Retry',
    loading: 'Loading data...',
    errorLoadingTop100: 'Unable to load Top 100 coins',
    apiLimitReached: 'CoinGecko API request limit reached.',
    useSearchInstead: 'Please use the search function to add coins.',
    minOneCoinRequired: 'At least one coin must be selected.',
    
    advertisement: 'Advertisement',
    adInquiryTitle: 'Advertising Inquiry',
    adInquiryDesc: 'Advertise your business in this space',
    
    exchangePrice: 'Exchange Price',
    localExchange: 'US Exchange',
    priceSpread: 'Price Spread',
    
    contact: 'Contact',
    
    userGuideTitle: 'User Guide',
    
    // AI Forecast
    aiForecastTitle: 'AI Coin Forecast Analysis',
    aiForecastSubtitle: 'AI-powered 1-week short-term forecast',
    forecastOutlook: 'Outlook',
    forecastConfidence: 'Confidence',
    forecastReasoning: 'Analysis',
    forecastAdvice: 'Advice',
    outlookBullish: 'Bullish',
    outlookBearish: 'Bearish',
    outlookNeutral: 'Neutral',
    aiForecastDisclaimer: '⚠️ AI analysis is for reference only and not investment advice.',
    lastUpdate: 'Last Update',
    change24h: '24h Change',
    thankYou: 'Thank you! 🙏',
    
    // Binance Ad
    adModalTitle: 'AI Forecast Sponsored by Binance',
    adModalSubtitle: 'Please wait a moment...',
    binanceBannerTitle: 'World\'s #1 Crypto Exchange',
    binanceBannerSubtitle: 'Trade on Binance now!',
    binanceCTA: 'Sign up now and get 20% fee discount →',
    adCountdownText: 'seconds until AI forecast',
    skipAd: 'Skip',
    secondsWait: 's wait...',
    skipAdNow: 'View AI Forecast →',
  },
  
  fr: {
    title: 'Tableau de Bord Crypto en Temps Réel',
    
    // Navigation
    navCoins: 'Liste des Cryptos',
    navAI: 'Prévision IA',
    navNews: 'Actualités',
    navBlog: 'Blog',
    
    fearGreedIndex: 'Indice de Peur et de Cupidité',
    selectedCoins: 'Pièces Sélectionnées',
    realTimeUpdate: 'Mise à Jour en Temps Réel',
    advice: {
      extremeFear: 'Opportunité d\'Achat!',
      fear: 'Achat Prudent',
      neutral: 'Conserver',
      greed: 'Signal de Vente'
    },
    
    searchPlaceholder: 'Rechercher nom ou symbole... (ex: Bitcoin, ETH, DOGE)',
    searchTitle: 'Rechercher et Ajouter des Pièces',
    browseTop100: 'Parcourir Top 100 Pièces',
    noSearchResults: 'Aucun résultat de recherche trouvé.',
    searchError: 'Une erreur s\'est produite lors de la recherche.',
    
    sortTitle: 'Trier Mes Pièces',
    sortDefault: 'Défaut',
    sortPriceHigh: 'Prix Élevé',
    sortPriceLow: 'Prix Bas',
    sortChangeHigh: 'Variation Élevée',
    sortChangeLow: 'Variation Basse',
    sortMarketCap: 'Capitalisation',
    sortFavorite: 'Favoris',
    
    kimchiPremium: 'Prime Kimchi',
    marketCap: 'Capitalisation',
    volume24h: 'Volume 24h',
    holding: 'Détention',
    avgPrice: 'Prix Moyen',
    chart: 'Graphique',
    portfolio: 'Portefeuille',
    addToFavorites: 'Ajouter aux Favoris',
    removeFromFavorites: 'Retirer des Favoris',
    removeCoin: 'Retirer',
    
    portfolioSummary: 'Résumé du Portefeuille',
    totalInvestment: 'Investissement Total',
    currentValue: 'Valeur Actuelle',
    profitLoss: 'Profit/Perte',
    profitRate: 'Taux de Profit',
    portfolioManagement: 'Gestion du Portefeuille',
    portfolioAmountPlaceholder: 'ex: 0.5',
    portfolioPricePlaceholder: 'ex: 50000',
    amount: 'Quantité',
    avgBuyPrice: 'Prix d\'Achat Moyen (USD)',
    currentPrice: 'Prix Actuel (USD)',
    save: 'Enregistrer',
    cancel: 'Annuler',
    enterAmountAndPrice: 'Entrez la quantité et le prix moyen.',
    investment: 'Investissement',
    profit: 'Profit',
    loss: 'Perte',
    
    priceChart: 'Graphique des Prix',
    days7: '7 jours',
    days30: '30 jours',
    days90: '90 jours',
    chartLoading: 'Chargement du graphique...',
    chartError: 'Impossible de charger le graphique.',
    chartErrorCheckConsole: 'Impossible de charger le graphique. Veuillez vérifier la console.',
    
    top100Title: 'Top 100 Cryptomonnaies',
    top10Title: 'Top 10 Cryptomonnaies',
    rank: 'Rang',
    coin: 'Pièce',
    price: 'Prix',
    viewAll: 'Voir Tout',
    close: 'Fermer',
    selected: 'Sélectionné',
    sortByMarketCap: 'Capitalisation',
    sortByVolume: 'Volume',
    sortByGainers: 'Hausses',
    sortByLosers: 'Baisses',
    
    cryptoNews: 'Dernières Nouvelles Crypto',
    translate: 'Traduire',
    original: 'Original',
    viewOriginal: 'Voir l\'Original',
    noDescription: 'Aucune description disponible.',
    readMore: 'Lire Plus',
    showLess: 'Réduire',
    loadAIForecast: 'Voir prévisions IA',
    aiForecastClickMsg: 'Cliquez pour voir l\'analyse IA de 10 pièces majeures (inclut publicité Binance)',
    aiForecastAnalyzing: 'L\'IA analyse le marché...',
    clickForFullArticle: 'Cliquez pour lire l\'article complet!',
    clickToViewArticle: 'Cliquez pour voir l\'article complet!',
    translating: 'Traduction en cours...',
    translationError: 'Erreur de traduction s\'est produite.',
    
    refresh: 'Actualiser',
    
    errorLoadingPrices: 'Impossible de charger les informations de prix.',
    pleaseRetry: 'Veuillez réessayer plus tard.',
    retry: 'Réessayer',
    loading: 'Chargement des données...',
    errorLoadingTop100: 'Impossible de charger le Top 100 des cryptomonnaies',
    apiLimitReached: 'Limite de requêtes API CoinGecko atteinte.',
    useSearchInstead: 'Veuillez utiliser la fonction de recherche pour ajouter des pièces.',
    minOneCoinRequired: 'Au moins une pièce doit être sélectionnée.',
    
    advertisement: 'Publicité',
    adInquiryTitle: 'Demande de Publicité',
    adInquiryDesc: 'Faites la publicité de votre entreprise dans cet espace',
    
    exchangePrice: 'Prix de l\'Échange',
    localExchange: 'Échange Européen',
    priceSpread: 'Écart de Prix',
    
    contact: 'Contact',
    
    userGuideTitle: 'Guide d\'Utilisation',
    
    // AI Forecast
    aiForecastTitle: 'Analyse des Prévisions de Pièces IA',
    aiForecastSubtitle: 'Prévision à court terme d\'une semaine par IA',
    forecastOutlook: 'Perspective',
    forecastConfidence: 'Confiance',
    forecastReasoning: 'Analyse',
    forecastAdvice: 'Conseil',
    outlookBullish: 'Haussier',
    outlookBearish: 'Baissier',
    outlookNeutral: 'Neutre',
    aiForecastDisclaimer: '⚠️ L\'analyse de l\'IA est à titre de référence uniquement et non un conseil d\'investissement.',
    lastUpdate: 'Dernière Mise à Jour',
    change24h: 'Changement 24h',
    adHelpMessage: '💡 Regarder les publicités aide à soutenir ce service gratuit',
    thankYou: 'Merci ! 🙏',
    
    // Binance Ad
    adModalTitle: 'Prévision IA sponsorisée par Binance',
    adModalSubtitle: 'Veuillez patienter un instant...',
    binanceBannerTitle: 'Échange Crypto N°1 Mondial',
    binanceBannerSubtitle: 'Tradez sur Binance maintenant!',
    binanceCTA: 'Inscrivez-vous et obtenez 20% de réduction sur les frais →',
    adCountdownText: 'secondes avant la prévision IA',
    skipAd: 'Passer',
    skipAdNow: 'Passer maintenant',
    secondsWait: 's d\'attente...'
  },
  
  de: {
    title: 'Echtzeit-Krypto-Dashboard',
    
    // Navigation
    navCoins: 'Kryptoliste',
    navAI: 'KI-Prognose',
    navNews: 'Nachrichten',
    navBlog: 'Blog',
    
    fearGreedIndex: 'Angst- und Gier-Index',
    selectedCoins: 'Ausgewählte Münzen',
    realTimeUpdate: 'Echtzeit-Update',
    advice: {
      extremeFear: 'Kaufgelegenheit!',
      fear: 'Vorsichtiger Kauf',
      neutral: 'Halten',
      greed: 'Verkaufssignal'
    },
    
    searchPlaceholder: 'Münzname oder Symbol suchen... (z.B. Bitcoin, ETH, DOGE)',
    searchTitle: 'Münzen Suchen und Hinzufügen',
    browseTop100: 'Top 100 Münzen Durchsuchen',
    noSearchResults: 'Keine Suchergebnisse gefunden.',
    searchError: 'Bei der Suche ist ein Fehler aufgetreten.',
    
    sortTitle: 'Meine Münzen Sortieren',
    sortDefault: 'Standard',
    sortPriceHigh: 'Preis Hoch',
    sortPriceLow: 'Preis Niedrig',
    sortChangeHigh: 'Änderung Hoch',
    sortChangeLow: 'Änderung Niedrig',
    sortMarketCap: 'Marktkapitalisierung',
    sortFavorite: 'Favoriten',
    
    kimchiPremium: 'Kimchi-Prämie',
    marketCap: 'Marktkapitalisierung',
    volume24h: '24h Volumen',
    holding: 'Bestand',
    avgPrice: 'Durchschnittspreis',
    chart: 'Diagramm',
    portfolio: 'Portfolio',
    addToFavorites: 'Zu Favoriten Hinzufügen',
    removeFromFavorites: 'Aus Favoriten Entfernen',
    removeCoin: 'Entfernen',
    
    portfolioSummary: 'Portfolio-Zusammenfassung',
    totalInvestment: 'Gesamtinvestition',
    currentValue: 'Aktueller Wert',
    profitLoss: 'Gewinn/Verlust',
    profitRate: 'Gewinnrate',
    portfolioManagement: 'Portfolio-Verwaltung',
    portfolioAmountPlaceholder: 'z.B. 0.5',
    portfolioPricePlaceholder: 'z.B. 50000',
    amount: 'Menge',
    avgBuyPrice: 'Durchschn. Kaufpreis (USD)',
    currentPrice: 'Aktueller Preis (USD)',
    save: 'Speichern',
    cancel: 'Abbrechen',
    enterAmountAndPrice: 'Geben Sie Menge und Durchschnittspreis ein.',
    investment: 'Investition',
    profit: 'Gewinn',
    loss: 'Verlust',
    
    priceChart: 'Preisdiagramm',
    days7: '7 Tage',
    days30: '30 Tage',
    days90: '90 Tage',
    chartLoading: 'Diagramm wird geladen...',
    chartError: 'Diagramm kann nicht geladen werden.',
    chartErrorCheckConsole: 'Diagramm kann nicht geladen werden. Bitte überprüfen Sie die Konsole.',
    
    top100Title: 'Top 100 Kryptowährungen',
    top10Title: 'Top 10 Kryptowährungen',
    rank: 'Rang',
    coin: 'Münze',
    price: 'Preis',
    viewAll: 'Alle Anzeigen',
    close: 'Schließen',
    selected: 'Ausgewählt',
    sortByMarketCap: 'Marktkapitalisierung',
    sortByVolume: 'Volumen',
    sortByGainers: 'Top-Gewinner',
    sortByLosers: 'Top-Verlierer',
    
    cryptoNews: 'Neueste Krypto-Nachrichten',
    translate: 'Übersetzen',
    original: 'Original',
    viewOriginal: 'Original Ansehen',
    noDescription: 'Keine Beschreibung verfügbar.',
    readMore: 'Mehr Lesen',
    showLess: 'Weniger Anzeigen',
    loadAIForecast: 'KI-Prognose anzeigen',
    aiForecastClickMsg: 'Klicken Sie hier für die KI-Analyse von 10 Hauptmünzen (inkl. Binance-Werbung)',
    aiForecastAnalyzing: 'KI analysiert den Markt...',
    clickForFullArticle: 'Klicken Sie, um den vollständigen Artikel zu lesen!',
    clickToViewArticle: 'Klicken Sie, um den vollständigen Artikel anzuzeigen!',
    translating: 'Übersetzen...',
    translationError: 'Übersetzungsfehler ist aufgetreten.',
    
    refresh: 'Aktualisieren',
    
    errorLoadingPrices: 'Preisinformationen können nicht geladen werden.',
    pleaseRetry: 'Bitte versuchen Sie es später erneut.',
    retry: 'Wiederholen',
    loading: 'Daten werden geladen...',
    errorLoadingTop100: 'Top 100 Münzen können nicht geladen werden',
    apiLimitReached: 'CoinGecko API-Anfragelimit erreicht.',
    useSearchInstead: 'Bitte verwenden Sie die Suchfunktion, um Münzen hinzuzufügen.',
    minOneCoinRequired: 'Mindestens eine Münze muss ausgewählt werden.',
    
    advertisement: 'Werbung',
    adInquiryTitle: 'Werbeanfrage',
    adInquiryDesc: 'Werben Sie für Ihr Unternehmen in diesem Bereich',
    
    exchangePrice: 'Börsenpreis',
    localExchange: 'Deutsche Börse',
    priceSpread: 'Preisunterschied',
    
    contact: 'Kontakt',
    
    userGuideTitle: 'Benutzerhandbuch',
    
    // AI Forecast
    aiForecastTitle: 'KI-Münzprognoseanalyse',
    aiForecastSubtitle: '1-Wochen-Kurzfristprognose durch KI',
    forecastOutlook: 'Ausblick',
    forecastConfidence: 'Vertrauen',
    forecastReasoning: 'Analyse',
    forecastAdvice: 'Rat',
    outlookBullish: 'Bullisch',
    outlookBearish: 'Bärisch',
    outlookNeutral: 'Neutral',
    aiForecastDisclaimer: '⚠️ Die KI-Analyse dient nur als Referenz und ist keine Anlageberatung.',
    lastUpdate: 'Letztes Update',
    change24h: '24h Änderung',
    adHelpMessage: '💡 Werbung schauen hilft, diesen Service kostenlos zu halten',
    thankYou: 'Vielen Dank! 🙏',
    
    // Binance Ad
    adModalTitle: 'KI-Prognose gesponsert von Binance',
    adModalSubtitle: 'Bitte warten Sie einen Moment...',
    binanceBannerTitle: 'Weltweit führende Krypto-Börse',
    binanceBannerSubtitle: 'Handeln Sie jetzt auf Binance!',
    binanceCTA: 'Jetzt registrieren und 20% Gebührenrabatt erhalten →',
    adCountdownText: 'Sekunden bis zur KI-Prognose',
    skipAd: 'Überspringen',
    skipAdNow: 'Jetzt überspringen',
    secondsWait: 's warten...'
  },
  
  es: {
    title: 'Panel de Criptomonedas en Tiempo Real',
    
    // Navigation
    navCoins: 'Lista de Criptos',
    navAI: 'Pronóstico IA',
    navNews: 'Noticias',
    navBlog: 'Blog',
    
    fearGreedIndex: 'Índice de Miedo y Codicia',
    selectedCoins: 'Monedas Seleccionadas',
    realTimeUpdate: 'Actualización en Tiempo Real',
    advice: {
      extremeFear: '¡Oportunidad de Compra!',
      fear: 'Compra Cautelosa',
      neutral: 'Mantener',
      greed: 'Señal de Venta'
    },
    
    searchPlaceholder: 'Buscar nombre o símbolo... (ej: Bitcoin, ETH, DOGE)',
    searchTitle: 'Buscar y Agregar Monedas',
    browseTop100: 'Explorar Top 100 Monedas',
    noSearchResults: 'No se encontraron resultados de búsqueda.',
    searchError: 'Se produjo un error durante la búsqueda.',
    
    sortTitle: 'Ordenar Mis Monedas',
    sortDefault: 'Predeterminado',
    sortPriceHigh: 'Precio Alto',
    sortPriceLow: 'Precio Bajo',
    sortChangeHigh: 'Cambio Alto',
    sortChangeLow: 'Cambio Bajo',
    sortMarketCap: 'Capitalización',
    sortFavorite: 'Favoritos',
    
    kimchiPremium: 'Prima Kimchi',
    marketCap: 'Capitalización',
    volume24h: 'Volumen 24h',
    holding: 'Tenencia',
    avgPrice: 'Precio Promedio',
    chart: 'Gráfico',
    portfolio: 'Cartera',
    addToFavorites: 'Agregar a Favoritos',
    removeFromFavorites: 'Quitar de Favoritos',
    removeCoin: 'Eliminar',
    
    portfolioSummary: 'Resumen de Cartera',
    totalInvestment: 'Inversión Total',
    currentValue: 'Valor Actual',
    profitLoss: 'Ganancia/Pérdida',
    profitRate: 'Tasa de Ganancia',
    portfolioManagement: 'Gestión de Cartera',
    portfolioAmountPlaceholder: 'ej: 0.5',
    portfolioPricePlaceholder: 'ej: 50000',
    amount: 'Cantidad',
    avgBuyPrice: 'Precio de Compra Promedio (USD)',
    currentPrice: 'Precio Actual (USD)',
    save: 'Guardar',
    cancel: 'Cancelar',
    enterAmountAndPrice: 'Ingrese cantidad y precio promedio.',
    investment: 'Inversión',
    profit: 'Ganancia',
    loss: 'Pérdida',
    
    priceChart: 'Gráfico de Precios',
    days7: '7 días',
    days30: '30 días',
    days90: '90 días',
    chartLoading: 'Cargando gráfico...',
    chartError: 'No se puede cargar el gráfico.',
    chartErrorCheckConsole: 'No se puede cargar el gráfico. Por favor, verifique la consola.',
    
    top100Title: 'Top 100 Criptomonedas',
    top10Title: 'Top 10 Criptomonedas',
    rank: 'Rango',
    coin: 'Moneda',
    price: 'Precio',
    viewAll: 'Ver Todo',
    close: 'Cerrar',
    selected: 'Seleccionado',
    sortByMarketCap: 'Capitalización',
    sortByVolume: 'Volumen',
    sortByGainers: 'Mayores Ganancias',
    sortByLosers: 'Mayores Pérdidas',
    
    cryptoNews: 'Últimas Noticias Crypto',
    translate: 'Traducir',
    original: 'Original',
    viewOriginal: 'Ver Original',
    noDescription: 'Sin descripción disponible.',
    readMore: 'Leer Más',
    showLess: 'Mostrar Menos',
    loadAIForecast: 'Ver pronóstico IA',
    aiForecastClickMsg: 'Haz clic para ver el análisis IA de 10 monedas principales (incluye anuncio de Binance)',
    aiForecastAnalyzing: 'La IA está analizando el mercado...',
    clickForFullArticle: '¡Haga clic para leer el artículo completo!',
    clickToViewArticle: '¡Haga clic para ver el artículo completo!',
    translating: 'Traduciendo...',
    translationError: 'Se produjo un error de traducción.',
    
    refresh: 'Actualizar',
    
    errorLoadingPrices: 'No se puede cargar la información de precios.',
    pleaseRetry: 'Por favor, inténtelo de nuevo más tarde.',
    retry: 'Reintentar',
    loading: 'Cargando datos...',
    errorLoadingTop100: 'No se puede cargar el Top 100 de criptomonedas',
    apiLimitReached: 'Límite de solicitudes de API CoinGecko alcanzado.',
    useSearchInstead: 'Por favor, use la función de búsqueda para agregar monedas.',
    minOneCoinRequired: 'Al menos una moneda debe estar seleccionada.',
    
    advertisement: 'Publicidad',
    adInquiryTitle: 'Consulta de Publicidad',
    adInquiryDesc: 'Anuncie su negocio en este espacio',
    
    exchangePrice: 'Precio de Intercambio',
    localExchange: 'Intercambio Español',
    priceSpread: 'Diferencia de Precio',
    
    contact: 'Contacto',
    
    userGuideTitle: 'Guía de Uso',
    
    // AI Forecast
    aiForecastTitle: 'Análisis de Pronóstico de Monedas IA',
    aiForecastSubtitle: 'Pronóstico a corto plazo de 1 semana por IA',
    forecastOutlook: 'Perspectiva',
    forecastConfidence: 'Confianza',
    forecastReasoning: 'Análisis',
    forecastAdvice: 'Consejo',
    outlookBullish: 'Alcista',
    outlookBearish: 'Bajista',
    outlookNeutral: 'Neutral',
    aiForecastDisclaimer: '⚠️ El análisis de IA es solo de referencia y no es asesoramiento de inversión.',
    lastUpdate: 'Última Actualización',
    change24h: 'Cambio 24h',
    adHelpMessage: '💡 Ver anuncios ayuda a mantener este servicio gratuito',
    thankYou: '¡Gracias! 🙏'
  }
};

// 현재 언어 (URL 파라미터 우선, 그 다음 localStorage, 마지막으로 기본값)
const urlParams = new URLSearchParams(window.location.search);
const urlLang = urlParams.get('lang');
let currentLang = urlLang || localStorage.getItem('language') || 'ko';

// URL 파라미터가 있으면 localStorage에도 저장
if (urlLang) {
  localStorage.setItem('language', urlLang);
}


// 텍스트 가져오기
function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// 언어 변경
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  
  // Google Analytics 트래킹
  if (typeof gtag !== 'undefined') {
    gtag('event', 'language_change', { language: lang });
  }
  
  // 페이지 새로고침하여 모든 텍스트 업데이트
  location.reload();
}
