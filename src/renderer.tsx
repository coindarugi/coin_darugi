import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  const version = 'v5.3.1' // 🔥 3-5줄 요약 + 원문 보기 버튼으로 이동
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta name="coinzilla" content="e512e39981091254c6e7fe6b3e725329" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        
        {/* SEO Meta Tags */}
        <title>암호화폐 실시간 대시보드 | AI 전망, 10,000+ 코인 추적, 김치 프리미엄</title>
        <meta name="description" content="AI 기반 코인 전망과 10,000개 이상의 암호화폐를 실시간 추적. 김치 프리미엄 계산기, 포트폴리오 관리, 실시간 뉴스 번역. 비트코인, 이더리움, 리플 등 모든 코인 정보를 한눈에!" />
        <meta name="keywords" content="암호화폐, 비트코인, 이더리움, AI 전망, 코인 분석, 김치 프리미엄, 업비트, 빗썸, 코인원, 실시간 시세, 포트폴리오, 크립토, Bitcoin, Ethereum, Crypto AI, Crypto Dashboard" />
        <meta name="author" content="Crypto Dashboard" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Korean" />
        <meta name="revisit-after" content="1 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crypto-darugi.com/" />
        <meta property="og:title" content="암호화폐 실시간 대시보드 | AI 전망, 10,000+ 코인 추적" />
        <meta property="og:description" content="AI 기반 코인 전망, 10,000개 이상의 암호화폐 실시간 추적, 김치 프리미엄 계산기, 포트폴리오 관리. 무료!" />
        <meta property="og:image" content="https://crypto-darugi.com/og-image.png" />
        <meta property="og:site_name" content="암호화폐 실시간 대시보드" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://crypto-darugi.com/" />
        <meta name="twitter:title" content="암호화폐 실시간 대시보드 | AI 전망, 10,000+ 코인" />
        <meta name="twitter:description" content="AI 기반 코인 전망, 10,000+ 암호화폐 실시간 추적, 김치 프리미엄 계산기" />
        <meta name="twitter:image" content="https://crypto-darugi.com/og-image.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://crypto-darugi.com/" />
        
        {/* 🌍 다국어 hreflang 태그 */}
        <link rel="alternate" hreflang="ko" href="https://crypto-darugi.com/?lang=ko" />
        <link rel="alternate" hreflang="en" href="https://crypto-darugi.com/?lang=en" />
        <link rel="alternate" hreflang="fr" href="https://crypto-darugi.com/?lang=fr" />
        <link rel="alternate" hreflang="de" href="https://crypto-darugi.com/?lang=de" />
        <link rel="alternate" hreflang="es" href="https://crypto-darugi.com/?lang=es" />
        <link rel="alternate" hreflang="x-default" href="https://crypto-darugi.com/" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preconnect" href="https://cdn.tailwindcss.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://acceptable.a-ads.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css" rel="stylesheet" />
        <link href={`/static/style.css?v=${version}`} rel="stylesheet" />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6947020717333296" crossorigin="anonymous"></script>
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
