# How to Build a Crypto Dashboard with Cloudflare Pages and Hono Framework

## Introduction

Building a cryptocurrency dashboard doesn't have to be complicated or expensive. In this tutorial, I'll show you how I built a production-ready crypto dashboard using **Cloudflare Pages** and **Hono framework** – completely serverless and free to deploy.

**🔗 [Live Demo: https://crypto-darugi.com](https://crypto-darugi.com)**

## Why Cloudflare Pages + Hono?

### Cloudflare Pages Benefits
- ✅ **Free Tier**: Unlimited bandwidth, 500 builds/month
- ✅ **Global CDN**: Sub-100ms latency worldwide
- ✅ **Serverless**: No server management
- ✅ **Auto-scaling**: Handle traffic spikes automatically
- ✅ **HTTPS**: Free SSL certificates

### Hono Framework Benefits
- ✅ **Ultra-fast**: 3x faster than Express.js
- ✅ **TypeScript**: Type-safe development
- ✅ **Lightweight**: ~12KB bundle size
- ✅ **Edge-first**: Built for Cloudflare Workers
- ✅ **Modern**: Clean, intuitive API

## Project Architecture

```
webapp/
├── src/
│   ├── index.tsx          # Hono backend
│   └── renderer.tsx       # HTML renderer
├── public/
│   └── static/
│       ├── app.js         # Frontend logic
│       ├── i18n.js        # Translations
│       └── style.css      # Styling
├── wrangler.jsonc         # Cloudflare config
├── package.json
└── vite.config.ts
```

## Step 1: Project Setup

### Install Dependencies

```bash
npm create hono@latest webapp -- --template cloudflare-pages --install --pm npm
cd webapp
npm install
```

### Project Structure

```bash
webapp/
├── src/
│   ├── index.tsx          # Main application
│   └── renderer.tsx       # HTML renderer
├── public/                # Static assets
├── wrangler.jsonc         # Cloudflare config
└── package.json
```

## Step 2: Backend Setup with Hono

### src/index.tsx

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Price endpoint
app.get('/api/prices', async (c) => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
  )
  const data = await response.json()
  return c.json(data)
})

// Main route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Crypto Dashboard</title>
      </head>
      <body>
        <h1>Crypto Dashboard</h1>
        <div id="app"></div>
        <script src="/static/app.js"></script>
      </body>
    </html>
  `)
})

export default app
```

## Step 3: Frontend Implementation

### public/static/app.js

```javascript
// Fetch crypto prices
async function loadPrices() {
  try {
    const response = await fetch('/api/prices')
    const data = await response.json()
    
    displayPrices(data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Display prices
function displayPrices(data) {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div>
      <h2>Bitcoin: $${data.bitcoin.usd}</h2>
      <h2>Ethereum: $${data.ethereum.usd}</h2>
    </div>
  `
}

// Auto-refresh every 30 seconds
setInterval(loadPrices, 30000)
loadPrices()
```

## Step 4: Styling with TailwindCSS

### public/static/style.css

```css
body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: white;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.coin-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Step 5: Caching Strategy

### Implement Smart Caching

```typescript
// Price cache (5 minutes)
const priceCache = {
  data: null,
  timestamp: 0,
  ttl: 300000 // 5 minutes
}

app.get('/api/prices', async (c) => {
  const now = Date.now()
  
  // Check cache
  if (priceCache.data && (now - priceCache.timestamp) < priceCache.ttl) {
    return c.json(priceCache.data)
  }
  
  // Fetch new data
  const response = await fetch('https://api.coingecko.com/api/v3/...')
  const data = await response.json()
  
  // Update cache
  priceCache.data = data
  priceCache.timestamp = now
  
  return c.json(data)
})
```

## Step 6: Multi-Language Support

### public/static/i18n.js

```javascript
const translations = {
  ko: {
    title: '암호화폐 실시간 대시보드',
    searchTitle: '코인 검색 및 추가'
  },
  en: {
    title: 'Crypto Real-time Dashboard',
    searchTitle: 'Search and Add Coins'
  }
}

let currentLang = 'ko'

function t(key) {
  return translations[currentLang][key] || key
}

function changeLanguage(lang) {
  currentLang = lang
  updateUI()
}
```

## Step 7: Configuration Files

### wrangler.jsonc

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
  build: {
    outDir: 'dist'
  }
})
```

### package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "wrangler pages dev dist",
    "deploy": "npm run build && wrangler pages deploy dist"
  }
}
```

## Step 8: Deployment to Cloudflare Pages

### Build the Project

```bash
npm run build
```

### Deploy

```bash
npx wrangler pages deploy dist --project-name webapp
```

### Setup Custom Domain (Optional)

```bash
npx wrangler pages domain add yourdomain.com --project-name webapp
```

## Advanced Features

### 1. AI-Powered Forecasts

```typescript
app.get('/api/ai-forecast', async (c) => {
  const OPENAI_API_KEY = c.env.OPENAI_API_KEY
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: 'Analyze Bitcoin price trends for next week'
      }]
    })
  })
  
  const data = await response.json()
  return c.json(data)
})
```

### 2. Portfolio Management

```typescript
// Store in localStorage (client-side)
function savePortfolio(coinId, amount, avgPrice) {
  const portfolio = JSON.parse(localStorage.getItem('portfolio') || '{}')
  portfolio[coinId] = { amount, avgPrice }
  localStorage.setItem('portfolio', JSON.stringify(portfolio))
}

function loadPortfolio() {
  return JSON.parse(localStorage.getItem('portfolio') || '{}')
}
```

### 3. Real-Time News

```typescript
app.get('/api/news', async (c) => {
  const response = await fetch(
    'https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_TOKEN&public=true'
  )
  const data = await response.json()
  return c.json(data)
})
```

## Performance Optimization

### 1. Code Splitting

```javascript
// Load Chart.js only when needed
async function loadChart() {
  if (!window.Chart) {
    await import('https://cdn.jsdelivr.net/npm/chart.js')
  }
  // Draw chart
}
```

### 2. Image Optimization

```html
<link rel="preconnect" href="https://api.coingecko.com">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

### 3. Lazy Loading

```javascript
// Intersection Observer for lazy content
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadAIForecast()
      observer.disconnect()
    }
  })
})
```

## SEO Optimization

### meta tags in renderer.tsx

```typescript
<head>
  <title>Crypto Dashboard | 10,000+ Coins Tracker</title>
  <meta name="description" content="Track 10,000+ cryptocurrencies..." />
  <meta property="og:title" content="Crypto Dashboard" />
  <meta property="og:description" content="..." />
  <link rel="canonical" href="https://yourdomain.com" />
</head>
```

## Cost Analysis

### Cloudflare Pages (Free Tier)
- ✅ 500 builds/month
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 100 custom domains

### External APIs
- CoinGecko: Free (50 calls/min)
- OpenAI: ~$0.01 per AI forecast

**Total Cost**: ~$0-5/month (depending on AI usage)

## Conclusion

Building a production-ready cryptocurrency dashboard with Cloudflare Pages and Hono is not only possible but also incredibly cost-effective. The combination provides enterprise-grade performance, global scalability, and developer-friendly tools.

**Key Takeaways**:
- Serverless architecture = No server management
- Cloudflare CDN = Global performance
- Hono framework = Developer productivity
- Free tier = Perfect for side projects

**Start building your crypto dashboard today!**

🔗 **[Live Demo](https://crypto-darugi.com)**
📚 **[Source Code](#)** (GitHub)

---

*Keywords: Cloudflare Pages tutorial, Hono framework, serverless crypto dashboard, Cloudflare Workers, edge computing, TypeScript tutorial, cryptocurrency dashboard tutorial*
