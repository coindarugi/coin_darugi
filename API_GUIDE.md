# API 설정 가이드

## 🎯 현재 상태: API 키 불필요!

현재 프로그램은 **API 키 없이 바로 작동**합니다. 아무 설정도 필요 없어요!

## 📊 사용 중인 무료 API

### 1. CoinGecko API (무료)
- **가격**: 무료
- **인증**: 불필요
- **제한**: 분당 10-50회
- **해결**: 60초 캐싱으로 제한 우회 ✅
- **지원 코인**: 10,000개 이상

### 2. Upbit API (무료)
- **가격**: 무료
- **인증**: 불필요
- **용도**: 김치 프리미엄 계산

## 💡 API 키가 필요한 경우 (선택사항)

더 빠른 업데이트나 더 많은 요청이 필요하면 API 키를 받을 수 있습니다.

### CoinGecko Pro API
1. **회원가입**: https://www.coingecko.com/en/api
2. **플랜 선택**:
   - Free: 무료 (분당 10-30회)
   - Demo: $0 (분당 30회)
   - Analyst: $129/월 (분당 500회)
   - Pro: $549/월 (분당 2000회)

3. **API 키 받기**: 대시보드에서 API 키 복사

### API 키 사용 방법

#### 방법 1: 환경 변수 파일 생성

```bash
# .dev.vars 파일 생성 (로컬 개발용)
COINGECKO_API_KEY=your_api_key_here
```

#### 방법 2: 코드 수정

`src/index.tsx` 파일에서:

```typescript
// API 키 설정 (선택사항)
const COINGECKO_API_KEY = 'your_api_key_here' // 또는 환경변수 사용

// API 요청 시 헤더에 추가
const response = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?ids=${allCoins}&vs_currencies=usd,krw&include_24hr_change=true&include_market_cap=true`,
  {
    headers: {
      'Accept': 'application/json',
      'x-cg-demo-api-key': COINGECKO_API_KEY // Pro API는 'x-cg-pro-api-key'
    }
  }
)
```

#### 방법 3: Cloudflare Pages 환경변수 (프로덕션)

```bash
# Cloudflare에 배포 후
npx wrangler pages secret put COINGECKO_API_KEY --project-name webapp

# 코드에서 사용
const COINGECKO_API_KEY = c.env.COINGECKO_API_KEY
```

## ✅ 결론

**API 키 없이도 완벽하게 작동합니다!**

- ✅ 10,000개 이상 코인 검색 가능
- ✅ 실시간 가격 추적
- ✅ 김치 프리미엄 계산
- ✅ 60초 캐싱으로 안정적 작동

API 키는 다음과 같은 경우에만 필요합니다:
- 더 빠른 업데이트 필요 (30초 이하)
- 동시 사용자 100명 이상
- 엔터프라이즈 기능 필요

---

**일반 사용자라면 API 키 설정 불필요합니다!** 👍
