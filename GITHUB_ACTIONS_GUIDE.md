# 🤖 GitHub Actions 자동 트윗 봇 설정 가이드

## ✨ 특징

- 🌍 **5개 언어 자동 트윗** (한국어, 영어, 프랑스어, 독일어, 스페인어)
- 💰 **다국어 화폐 단위** (₩ 원화, $ 달러, € 유로)
- ⏰ **하루 2회 자동 실행**
  - 1차: UTC 00:00 = 한국 오전 9시 (아시아 타임)
  - 2차: UTC 12:00 = 한국 오후 9시 (미국/유럽 타임)
- 🆓 **완전 무료** (GitHub Actions 무료 플랜)
- 🔧 **수동 실행 가능**

## 🚀 설정 방법

### 1️⃣ GitHub Repository 생성 (이미 있으면 skip)

1. https://github.com 접속
2. "New repository" 클릭
3. Repository 이름: `crypto-dashboard` (원하는 이름)
4. Public 또는 Private 선택
5. "Create repository" 클릭

### 2️⃣ GitHub Secrets 설정 (필수!)

Repository 설정에서 API 키를 안전하게 저장:

1. GitHub Repository로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** > **Actions** 클릭
4. **New repository secret** 버튼 클릭
5. 다음 5개 Secret 추가:

#### Secret 1: TWITTER_API_KEY
```
Name: TWITTER_API_KEY
Value: your_twitter_api_key_here
```

#### Secret 2: TWITTER_API_SECRET
```
Name: TWITTER_API_SECRET
Value: your_twitter_api_secret_here
```

#### Secret 3: TWITTER_ACCESS_TOKEN
```
Name: TWITTER_ACCESS_TOKEN
Value: your_twitter_access_token_here
```

#### Secret 4: TWITTER_ACCESS_SECRET
```
Name: TWITTER_ACCESS_SECRET
Value: your_twitter_access_secret_here
```

#### Secret 5: OPENAI_API_KEY
```
Name: OPENAI_API_KEY
Value: your_openai_api_key_here
```

### 3️⃣ 코드를 GitHub에 Push

```bash
cd /home/user/webapp

# GitHub 환경 설정 (setup_github_environment 호출 필요)
# 리모트 추가 (Repository URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/crypto-dashboard.git

# 코드 푸시
git add .
git commit -m "Add GitHub Actions crypto tweet bot"
git push -u origin main
```

### 4️⃣ GitHub Actions 활성화 확인

1. GitHub Repository의 **Actions** 탭 클릭
2. "I understand my workflows, go ahead and enable them" 클릭 (처음만)
3. 왼쪽에서 "🤖 Crypto Tweet Bot" workflow 확인

### 5️⃣ 수동 테스트 (선택사항)

자동 실행을 기다리지 않고 바로 테스트:

1. **Actions** 탭 > "🤖 Crypto Tweet Bot" 클릭
2. 오른쪽 **Run workflow** 버튼 클릭
3. "Run workflow" 확인
4. 실행 로그 확인하여 트윗 발행 확인

## 📅 자동 실행 시간표

```
매일 2회 자동 실행:

🌅 1차: UTC 00:00 (한국 오전 9시)
  → 아시아 사용자 타겟

🌙 2차: UTC 12:00 (한국 오후 9시)
  → 미국/유럽 사용자 타겟

매일 총 10개 트윗 발행 (5개 언어 × 2회)
```

## 🔧 실행 시간 변경

`.github/workflows/crypto-tweet-bot.yml` 파일에서 수정:

```yaml
schedule:
  - cron: '0 0 * * *'   # 첫 번째 실행
  - cron: '0 12 * * *'  # 두 번째 실행
```

**Cron 시간 예시:**
- `'0 0 * * *'` → UTC 00:00 (한국 오전 9시)
- `'0 9 * * *'` → UTC 09:00 (한국 오후 6시)
- `'0 12 * * *'` → UTC 12:00 (한국 오후 9시)
- `'0 */6 * * *'` → 6시간마다

## 📊 모니터링

### GitHub Actions 로그 확인
1. Repository > **Actions** 탭
2. 실행된 workflow 클릭
3. "Run crypto tweet bot" 단계에서 상세 로그 확인

### 트윗 확인
Twitter 계정 `@coin_darugi`에서 발행된 트윗 확인

## 🐛 문제 해결

### Actions가 실행되지 않아요
- **원인 1**: Repository가 Private이고 GitHub Actions 무료 한도 초과
  - **해결**: Repository를 Public으로 변경 또는 유료 플랜 구독
- **원인 2**: Workflow 파일 위치가 잘못됨
  - **해결**: `.github/workflows/crypto-tweet-bot.yml` 경로 확인
- **원인 3**: Secrets가 설정되지 않음
  - **해결**: Settings > Secrets and variables > Actions에서 5개 Secret 확인

### 트윗이 발행되지 않아요
- **원인 1**: X API 권한 문제
  - **해결**: X Developer Portal에서 앱 권한이 "Read and Write"인지 확인
- **원인 2**: Secret 값이 잘못됨
  - **해결**: GitHub Secrets 값 재확인 (공백, 줄바꿈 없이)
- **원인 3**: API 한도 초과
  - **해결**: X API 무료 플랜 한도 확인 (월 1,667 트윗)

### Actions 로그에서 에러 확인
```bash
# Actions 탭 > 실행된 workflow 클릭 > 에러 메시지 확인
```

## 💰 비용

- **GitHub Actions**: 무료 (Public repo 무료, Private repo 월 2,000분 무료)
- **X API**: 무료 (월 1,667 트윗, 하루 2회 × 5개 언어 = 하루 10개 트윗 → 충분!)
- **OpenAI API**: 사용량 기반 (GPT-4o-mini는 매우 저렴)
- **CoinGecko API**: 무료

**예상 월 비용: $0 ~ $2** (OpenAI API만 약간 발생)

## 📞 문의

문제가 있으시면:
- Email: coin.darugi@gmail.com
- Twitter: @coin_darugi

## 🎉 완료!

이제 매일 자동으로 5개 언어로 비트코인 분석 트윗이 발행됩니다! 🚀
