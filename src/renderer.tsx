import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, lang }) => {
  const version = `v5.3.7-${Date.now()}` // 🔥 타임스탬프로 강제 캐시 무효화
  
  // 🌍 다국어 이미지 지원
  const currentLang = (lang as string) || 'ko'
  const validLangs = ['ko', 'en', 'fr', 'de', 'es']
  const imageLang = validLangs.includes(currentLang) ? currentLang : 'ko'
  const ogImageUrl = `https://crypto-darugi.com/og-image-${imageLang}.png?v=${Date.now()}`
  
  // 🌍 다국어 메타 태그
  const metaData: Record<string, any> = {
    ko: {
      htmlLang: 'ko',
      title: '암호화폐 실시간 대시보드 | AI 전망·김치 프리미엄',
      description: 'AI 기반 암호화폐 실시간 추적. 10,000+ 코인, 김치 프리미엄 계산기, 포트폴리오 관리. 비트코인·이더리움 등 모든 코인 정보를 한눈에!',
      ogTitle: '암호화폐 실시간 대시보드 | AI 전망, 10,000+ 코인 추적',
      ogDescription: 'AI 기반 코인 전망, 10,000개 이상의 암호화폐 실시간 추적, 김치 프리미엄 계산기, 포트폴리오 관리. 무료!',
      ogImageAlt: '암호화폐 실시간 대시보드 - AI 전망, 김치 프리미엄',
      siteName: '암호화폐 실시간 대시보드',
      locale: 'ko_KR'
    },
    en: {
      htmlLang: 'en',
      title: 'Crypto Dashboard | AI Forecast, 10,000+ Coins',
      description: 'Real-time crypto tracking with AI. 10,000+ coins, Kimchi premium calculator, portfolio management. All coin info at a glance!',
      ogTitle: 'Crypto Dashboard | AI Forecast, 10,000+ Coins',
      ogDescription: 'AI-powered crypto forecast, real-time tracking of 10,000+ cryptocurrencies, Kimchi premium calculator, portfolio management. Free!',
      ogImageAlt: 'Crypto Real-time Dashboard - AI Forecast, Kimchi Premium',
      siteName: 'Crypto Real-time Dashboard',
      locale: 'en_US'
    },
    fr: {
      htmlLang: 'fr',
      title: 'Tableau de bord Crypto | IA, 10 000+ pièces',
      description: 'Suivi crypto en temps réel avec IA. 10 000+ pièces, calculateur de prime Kimchi, gestion de portefeuille.',
      ogTitle: 'Tableau de bord Crypto | Prévisions IA, 10 000+ pièces',
      ogDescription: 'Prévisions crypto par IA, suivi en temps réel de 10 000+ cryptomonnaies, calculateur de prime Kimchi. Gratuit!',
      ogImageAlt: 'Tableau de bord crypto en temps réel - Prévisions IA',
      siteName: 'Tableau de bord Crypto',
      locale: 'fr_FR'
    },
    de: {
      htmlLang: 'de',
      title: 'Krypto-Dashboard | KI-Prognose, 10.000+ Coins',
      description: 'Echtzeit-Krypto-Tracking mit KI. 10.000+ Coins, Kimchi-Premium-Rechner, Portfolio-Management.',
      ogTitle: 'Krypto-Dashboard | KI-Prognose, 10.000+ Coins',
      ogDescription: 'KI-gestützte Krypto-Prognose, Echtzeit-Tracking von 10.000+ Kryptowährungen, Kimchi-Premium-Rechner. Kostenlos!',
      ogImageAlt: 'Krypto-Echtzeit-Dashboard - KI-Prognose',
      siteName: 'Krypto-Dashboard',
      locale: 'de_DE'
    },
    es: {
      htmlLang: 'es',
      title: 'Panel Cripto | Pronóstico IA, 10,000+ monedas',
      description: 'Seguimiento cripto en tiempo real con IA. 10,000+ monedas, calculadora de prima Kimchi, gestión de cartera.',
      ogTitle: 'Panel Cripto | Pronóstico IA, 10,000+ monedas',
      ogDescription: 'Pronóstico cripto con IA, seguimiento en tiempo real de 10,000+ criptomonedas, calculadora de prima Kimchi. ¡Gratis!',
      ogImageAlt: 'Panel de Cripto en Tiempo Real - Pronóstico IA',
      siteName: 'Panel de Cripto',
      locale: 'es_ES'
    }
  }
  
  const meta = metaData[imageLang]
  
  return (
    <html lang={meta.htmlLang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta name="coinzilla" content="e512e39981091254c6e7fe6b3e725329" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="크립토 대시보드" />
        
        {/* SEO Meta Tags */}
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content="암호화폐, 비트코인, 이더리움, AI 전망, 코인 분석, 김치 프리미엄, 업비트, 빗썸, 코인원, 실시간 시세, 포트폴리오, 크립토, Bitcoin, Ethereum, Crypto AI, Crypto Dashboard" />
        <meta name="author" content="Crypto Dashboard" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content={meta.htmlLang} />
        <meta name="revisit-after" content="1 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crypto-darugi.com/" />
        <meta property="og:title" content={meta.ogTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1376" />
        <meta property="og:image:height" content="768" />
        <meta property="og:image:alt" content={meta.ogImageAlt} />
        <meta property="og:site_name" content={meta.siteName} />
        <meta property="og:locale" content={meta.locale} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://crypto-darugi.com/" />
        <meta name="twitter:title" content={meta.ogTitle} />
        <meta name="twitter:description" content={meta.ogDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={meta.siteName} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://crypto-darugi.com/" />
        
        {/* 🌍 다국어 hreflang 태그 */}
        <link rel="alternate" hrefLang="ko" href="https://crypto-darugi.com/" />
        <link rel="alternate" hrefLang="en" href="https://crypto-darugi.com/" />
        <link rel="alternate" hrefLang="fr" href="https://crypto-darugi.com/" />
        <link rel="alternate" hrefLang="de" href="https://crypto-darugi.com/" />
        <link rel="alternate" hrefLang="es" href="https://crypto-darugi.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://crypto-darugi.com/" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preconnect" href="https://cdn.tailwindcss.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://acceptable.a-ads.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `tailwind.config = { corePlugins: { preflight: false } }`
        }}></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css" rel="stylesheet" />
        <link href={`/static/style.css?v=${version}`} rel="stylesheet" />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6947020717333296" crossorigin="anonymous"></script>
        
        {/* Google Analytics (GA4) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4M57WPZ083"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4M57WPZ083');
          `
        }}></script>
        
        {/* Cloudflare Web Analytics */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "e9e8757e23c242308640019549bcd05a"}'></script>
        
        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "암호화폐 실시간 대시보드",
            "description": "AI 기반 코인 전망과 10,000개 이상의 암호화폐를 실시간으로 추적하는 무료 대시보드. 김치 프리미엄 계산기, 포트폴리오 관리, 실시간 뉴스 번역 제공",
            "url": "https://crypto-darugi.com",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "AI 기반 암호화폐 전망 분석",
              "실시간 암호화폐 가격 추적",
              "김치 프리미엄 계산기",
              "포트폴리오 관리",
              "실시간 뉴스 번역",
              "10,000+ 코인 지원",
              "다국어 지원 (한국어, 영어, 프랑스어, 독일어, 스페인어)"
            ],
            "screenshot": "https://crypto-darugi.com/og-image.png",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "inLanguage": ["ko", "en", "fr", "de", "es"]
          }
        `}</script>
      </head>
      <body class="bg-gray-900 text-white">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
        <script src={`/static/i18n.js?v=${version}`}></script>
        <script src={`/static/app.js?v=${version}`}></script>
      </body>
    </html>
  )
})
