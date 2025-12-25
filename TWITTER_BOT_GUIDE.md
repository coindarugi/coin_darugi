# 🤖 암호화폐 자동 트윗 봇 배포 가이드

## ✨ 기능

- 🌍 **5개 언어 자동 트윗** (한국어, 영어, 프랑스어, 독일어, 스페인어)
- 💰 **다국어 화폐 단위** (₩ 원화, $ 달러, € 유로)
- 📊 **실시간 비트코인 데이터** (CoinGecko API)
- 🤖 **AI 분석** (OpenAI GPT-4o-mini)
- ⏰ **자동 스케줄링** (Cloudflare Cron - 하루 2회)
- 🔗 **사이트 홍보** (모든 트윗에 사이트 URL 포함)

## 📅 자동 실행 시간

```
1회: UTC 00:00 = 한국 오전 9시  (아시아 타임)
2회: UTC 12:00 = 한국 오후 9시  (미국/유럽 타임)
```

## 🚀 배포 방법

### 1️⃣ Cloudflare 환경 변수 설정

```bash
# Cloudflare API 인증
npx wrangler login

# X (Twitter) API 키 설정
npx wrangler pages secret put TWITTER_API_KEY --project-name webapp
# 입력: your_twitter_api_key_here

npx wrangler pages secret put TWITTER_API_SECRET --project-name webapp
# 입력: your_twitter_api_secret_here

npx wrangler pages secret put TWITTER_ACCESS_TOKEN --project-name webapp
# 입력: your_twitter_access_token_here

npx wrangler pages secret put TWITTER_ACCESS_SECRET --project-name webapp
# 입력: your_twitter_access_secret_here

# OpenAI API 키 설정
npx wrangler pages secret put OPENAI_API_KEY --project-name webapp
# 입력: your_openai_api_key_here
```

### 2️⃣ 프로젝트 배포

```bash
# 빌드
npm run build

# Cloudflare Pages에 배포
npx wrangler pages deploy dist --project-name webapp
```

### 3️⃣ 수동 테스트

배포 완료 후 바로 테스트:

```bash
# 브라우저에서
https://webapp.pages.dev/api/run-crypto-bot

# 또는 curl로
curl https://webapp.pages.dev/api/run-crypto-bot
```

## 📝 트윗 예시

### 한국어 (원화)
```
🪙 비트코인(BTC) 오늘의 AI 분석

💰 ₩1.27억 (↑0.91%)
📊 24h Vol: ₩36.01조

🤖 현재 비트코인은 ₩1.27억으로 거래되고 있으며...

⚠️ 투자 판단은 신중히! 본 정보는 투자 조언이 아닙니다.

🔗 https://crypto-dashboard-secure.pages.dev/

#비트코인 #BTC #암호화폐 #AI분석
```

### 영어 (달러)
```
🪙 Bitcoin(BTC) Daily AI Analysis

💰 $87,743 (↑0.91%)
📊 24h Vol: $24.91B

🤖 Bitcoin is currently trading at $87,743...

⚠️ DYOR - Not financial advice.

🔗 https://crypto-dashboard-secure.pages.dev/

#Bitcoin #BTC #Crypto #AIAnalysis
```

### 프랑스어/독일어/스페인어 (유로)
```
🪙 Bitcoin(BTC) Analyse IA du jour

💰 €74,520 (↑0.91%)
📊 24h Vol: €21.16B

🤖 Le Bitcoin se négocie actuellement à €74,520...

⚠️ DYOR - Pas un conseil financier.

🔗 https://crypto-dashboard-secure.pages.dev/

#Bitcoin #BTC #Crypto #AnalyseIA
```

## 🔧 Cron 시간 변경

`wrangler.jsonc` 파일에서 수정:

```jsonc
"triggers": {
  "crons": [
    "0 0 * * *",   // 첫 번째 실행 시간
    "0 12 * * *"   // 두 번째 실행 시간
  ]
}
```

**시간 예시:**
- `"0 0 * * *"` → UTC 00:00 (한국 오전 9시)
- `"0 9 * * *"` → UTC 09:00 (한국 오후 6시)
- `"0 12 * * *"` → UTC 12:00 (한국 오후 9시)

## 📊 모니터링

### Cloudflare Dashboard에서 확인
1. https://dash.cloudflare.com 접속
2. Pages 프로젝트 선택
3. "Functions" 탭 → "Cron Triggers" 확인

### 로그 확인
```bash
npx wrangler pages deployment tail --project-name webapp
```

## 🐛 문제 해결

### 트윗이 발행되지 않아요
- X Developer Portal에서 앱 권한이 "Read and Write"인지 확인
- Access Token을 권한 변경 후 재생성했는지 확인
- Cloudflare 환경 변수가 올바르게 설정되었는지 확인

### Cron이 실행되지 않아요
- Cloudflare Pages에서 Cron Triggers가 활성화되었는지 확인
- 배포가 완료되었는지 확인
- 환경 변수가 프로덕션에 설정되었는지 확인

### 환경 변수 확인
```bash
npx wrangler pages secret list --project-name webapp
```

## 📞 문의

문제가 있으시면 언제든지 연락주세요:
- Email: coin.darugi@gmail.com
- Twitter: @coin_darugi

## 🎉 완료!

이제 매일 자동으로 5개 언어로 비트코인 분석 트윗이 발행됩니다! 🚀
