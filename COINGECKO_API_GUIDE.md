# CoinGecko API Key 적용 가이드

## 📌 Overview

현재 프로젝트는 **CoinGecko 무료 플랜**을 최적화하여 사용 중입니다.
필요 시 **Demo API Key (무료)**를 추가하여 안정성을 높일 수 있습니다.

---

## 🆓 무료 플랜 현황

### **현재 최적화 상태**
- ✅ 가격 API: 30초 캐시
- ✅ 김치 프리미엄: 60초 캐시
- ✅ 차트 데이터: 10분 캐시
- ✅ 자동 새로고침: 30초

### **예상 API 사용량**
```
5개 코인 추적 시:
- 가격 API: 2회/분
- 김치 프리미엄: 15회/분 (5개 × 3거래소)
- 차트: 사용자 클릭 시만
→ 총 약 17회/분 (무료 한도 30/min 이내)
```

---

## 🔑 Demo API Key 발급 (선택사항)

### **언제 필요한가?**
- 사용자가 10명 이상 동시 접속 시
- Rate limit 에러가 빈번하게 발생 시
- 더 안정적인 서비스를 원할 때

### **발급 방법**

#### 1. CoinGecko 계정 생성
```
https://www.coingecko.com/
→ Sign Up (무료)
→ 이메일 인증
```

#### 2. API Dashboard 접속
```
https://www.coingecko.com/en/api
→ "Create Demo Account" 클릭
→ Demo API Key 발급 (무료)
```

#### 3. API Key 복사
```
예시: CG-AbCdEf123456789...
```

---

## 🛠️ API Key 적용 방법

### **방법 1: 로컬 개발 (.dev.vars)**

1. 프로젝트 루트에 `.dev.vars` 파일 생성:
```bash
cd /home/user/webapp
touch .dev.vars
```

2. API Key 추가:
```bash
COINGECKO_API_KEY=your_demo_api_key_here
```

3. 코드 수정 (`src/index.tsx`):
```typescript
// 환경변수에서 API Key 가져오기
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ''

// API 호출 시 헤더에 추가
const response = await fetch(
  'https://api.coingecko.com/api/v3/simple/price?...',
  {
    headers: {
      'Accept': 'application/json',
      'x-cg-demo-api-key': COINGECKO_API_KEY
    }
  }
)
```

---

### **방법 2: Cloudflare Pages 배포 (환경변수)**

#### Wrangler CLI로 설정:
```bash
cd /home/user/webapp

# 환경변수 설정
npx wrangler pages secret put COINGECKO_API_KEY --project-name webapp

# 입력 프롬프트에서 API Key 입력
```

#### Cloudflare Dashboard로 설정:
```
1. https://dash.cloudflare.com/ 로그인
2. Pages → webapp 선택
3. Settings → Environment variables
4. Add variable
   - Name: COINGECKO_API_KEY
   - Value: your_demo_api_key
5. Save
6. 재배포 (자동 또는 수동)
```

---

## 📊 API Key 효과

### **Demo API Key 사용 시**
- ✅ Rate limit 30/min → **안정적 보장**
- ✅ 우선순위 처리
- ✅ 에러 발생률 감소
- ✅ 여전히 **무료**

### **비교표**

| 항목 | 무료 (최적화) | Demo API Key | Paid Plan |
|------|--------------|-------------|-----------|
| Rate Limit | 30/min | 30/min (보장) | 500+/min |
| 비용 | $0 | $0 | $103+/월 |
| 안정성 | 보통 | 높음 | 매우 높음 |
| 추천 | 개인/테스트 | 소규모 서비스 | 상용 서비스 |

---

## 🚨 Rate Limit 모니터링

### **로그 확인**
```bash
cd /home/user/webapp
pm2 logs crypto-dashboard --nostream | grep "⚠️"
```

### **에러 패턴**
```
⚠️ Rate limit exceeded! Returning cached data...
→ API Key 고려 시점
```

### **대시보드 (선택)**
```
CoinGecko Dashboard에서 실시간 사용량 확인 가능
https://www.coingecko.com/en/api/dashboard
```

---

## 💡 결론

### **현재 권장사항**
1. **지금**: 최적화된 무료 플랜 사용 ($0)
2. **크몽 판매 시작**: Demo API Key 발급 ($0)
3. **월 2건+ 판매**: Paid Plan 고려 ($103/월)

### **다음 단계**
- ✅ 현재 최적화로 충분
- 🔄 사용자 증가 시 Demo API Key 적용
- 📈 매출 발생 시 Paid Plan 전환

---

## 📚 참고 자료

- CoinGecko API Docs: https://docs.coingecko.com/
- Pricing: https://www.coingecko.com/en/api/pricing
- Status: https://status.coingecko.com/
