export const translations = {
  ko: {
    // 헤더
    title: '암호화폐 실시간 대시보드',
    
    // 네비게이션
    navCoins: '코인 목록',
    navAI: 'AI 전망',
    navNews: '최신 뉴스',
    navBlog: '블로그',

    // Binance Ad
    adModalTitle: 'AI 전망은 바이낸스가 후원합니다',
    adModalSubtitle: '잠시만 기다려주세요...',
    binanceBannerTitle: '전세계 1위 암호화폐 거래소',
    binanceBannerSubtitle: '바이낸스에서 지금 거래하세요!',
    binanceCTA: '지금 가입하고 수수료 20% 할인 받기 →',
    adCountdownText: '초 후 AI 전망이 표시됩니다',
    skipAd: '건너뛰기',
    skipAdNow: '지금 건너뛰기',
    secondsWait: '초 대기...',
    aiForecastSubtitle: 'Top 10 코인 분석 & 바이낸스 후원',
    binanceAdNotice: '바이낸스 광고 포함',
    portfolioAmountPlaceholder: '예: 0.5',
    sources: '출처 & 참고문헌'
  },
  en: {
    // Header
    title: 'Crypto Real-time Dashboard',
    
    // Navigation
    navCoins: 'Coin List',
    navAI: 'AI Forecast',
    navNews: 'Latest News',
    navBlog: 'Blog',

    // Binance Ad
    adModalTitle: 'AI Outlook Sponsored by Binance',
    adModalSubtitle: 'Please wait a moment...',
    binanceBannerTitle: 'World\'s #1 Crypto Exchange',
    binanceBannerSubtitle: 'Trade now on Binance!',
    binanceCTA: 'Sign up now for 20% fee discount →',
    adCountdownText: 'seconds until AI forecast',
    skipAd: 'Skip',
    skipAdNow: 'Skip Now',
    secondsWait: 's wait...',
    aiForecastSubtitle: 'Top 10 Analysis & Sponsored by Binance',
    binanceAdNotice: 'Includes Binance Ad',
    portfolioAmountPlaceholder: 'Ex: 0.5',
    portfolioPricePlaceholder: 'Ex: 50000',
    sources: 'Sources & References'
  },
  fr: {
    // En-tête
    title: 'Tableau de bord crypto en temps réel',
    
    // Navigation
    navCoins: 'Liste des Cryptos',
    navAI: 'Prévision IA',
    navNews: 'Actualités',
    navBlog: 'Blog',

    // Binance Ad
    adModalTitle: 'Prévision IA sponsorisée par Binance',
    adModalSubtitle: 'Veuillez patienter...',
    binanceBannerTitle: '1ère Bourse Crypto Mondiale',
    binanceBannerSubtitle: 'Tradez maintenant sur Binance !',
    binanceCTA: 'Inscrivez-vous -20% sur les frais →',
    adCountdownText: 'secondes avant la prévision IA',
    skipAd: 'Passer',
    skipAdNow: 'Passer maintenant',
    secondsWait: 's attente...',
    aiForecastSubtitle: 'Analyse Top 10 & Sponsorisé par Binance',
    binanceAdNotice: 'Publicité Binance incluse',
    portfolioAmountPlaceholder: 'Ex: 0.5',
    portfolioPricePlaceholder: 'Ex: 50000',
    sources: 'Sources et références'
  },
  de: {
    // Kopfzeile
    title: 'Echtzeit-Krypto-Dashboard',
    
    // Navigation
    navCoins: 'Kryptoliste',
    navAI: 'KI-Prognose',
    navNews: 'Nachrichten',
    navBlog: 'Blog',

    // Binance Ad
    adModalTitle: 'KI-Ausblick gesponsert von Binance',
    adModalSubtitle: 'Bitte warten...',
    binanceBannerTitle: 'Weltweit Nr. 1 Krypto-Börse',
    binanceBannerSubtitle: 'Handeln Sie jetzt auf Binance!',
    binanceCTA: 'Jetzt anmelden & 20% Gebühren sparen →',
    adCountdownText: 'Sekunden bis zur KI-Prognose',
    skipAd: 'Überspringen',
    skipAdNow: 'Jetzt überspringen',
    secondsWait: 's warten...',
    aiForecastSubtitle: 'Top 10 Analyse & Gesponsert von Binance',
    binanceAdNotice: 'Enthält Binance-Werbung',
    portfolioAmountPlaceholder: 'Bsp: 0.5',
    portfolioPricePlaceholder: 'Bsp: 50000',
    sources: 'Quellen und Referenzen'
  },
  es: {
    // Encabezado
    title: 'Panel de criptomonedas en tiempo real',
    
    // Navegación
    navCoins: 'Lista de Criptos',
    navAI: 'Pronóstico IA',
    navNews: 'Noticias',
    navBlog: 'Blog',

    // Binance Ad
    adModalTitle: 'Pronóstico IA patrocinado por Binance',
    adModalSubtitle: 'Por favor espere...',
    binanceBannerTitle: 'El Exchange #1 del Mundo',
    binanceBannerSubtitle: '¡Opera ahora en Binance!',
    binanceCTA: 'Regístrate y ahorra 20% en comisiones →',
    adCountdownText: 'segundos para el pronóstico IA',
    skipAd: 'Saltar',
    skipAdNow: 'Saltar ahora',
    secondsWait: 's espera...',
    aiForecastSubtitle: 'Análisis Top 10 y Patrocinado por Binance',
    binanceAdNotice: 'Incluye anuncio de Binance',
    portfolioAmountPlaceholder: 'Ej: 0.5',
    portfolioPricePlaceholder: 'Ej: 50000',
    sources: 'Fuentes y referencias'
  }
} as const

export type SupportedLanguage = keyof typeof translations
