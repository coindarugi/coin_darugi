export const translations = {
  ko: {
    // 헤더
    title: '암호화폐 실시간 대시보드',
    
    // 네비게이션
    navCoins: '코인 목록',
    navAI: 'AI 전망',
    navNews: '최신 뉴스',
    navPortfolio: '블로그',
  },
  en: {
    // Header
    title: 'Crypto Real-time Dashboard',
    
    // Navigation
    navCoins: 'Coin List',
    navAI: 'AI Forecast',
    navNews: 'Latest News',
    navPortfolio: 'Blog',
  },
  fr: {
    // En-tête
    title: 'Tableau de bord crypto en temps réel',
    
    // Navigation
    navCoins: 'Liste des Cryptos',
    navAI: 'Prévision IA',
    navNews: 'Actualités',
    navPortfolio: 'Blog',
  },
  de: {
    // Kopfzeile
    title: 'Echtzeit-Krypto-Dashboard',
    
    // Navigation
    navCoins: 'Kryptoliste',
    navAI: 'KI-Prognose',
    navNews: 'Nachrichten',
    navPortfolio: 'Blog',
  },
  es: {
    // Encabezado
    title: 'Panel de criptomonedas en tiempo real',
    
    // Navegación
    navCoins: 'Lista de Criptos',
    navAI: 'Pronóstico IA',
    navNews: 'Noticias',
    navPortfolio: 'Blog',
  }
} as const

export type SupportedLanguage = keyof typeof translations
