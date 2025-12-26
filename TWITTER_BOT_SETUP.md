# 🤖 Twitter 자동 트윗 봇 설정 가이드

## ❌ 현재 상태: 실패 (2025-12-25 13:43 UTC)

### 🔍 문제 원인
**OpenAI API 키가 GitHub Secrets에 설정되지 않음**

```
OpenAIError: Missing credentials. Please pass an `apiKey`, 
or set the `OPENAI_API_KEY` environment variable.
```

### ✅ 해결 방법

#### 1️⃣ GitHub Secrets 설정
GitHub 리포지토리 → Settings → Secrets and variables → Actions → New repository secret

다음 5개의 Secret을 추가하세요:

| Secret 이름 | 설명 | 상태 |
|-------------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (GPT 분석용) | ❌ **필수 추가** |
| `TWITTER_API_KEY` | Twitter API Key | ✅ 설정됨 |
| `TWITTER_API_SECRET` | Twitter API Secret | ✅ 설정됨 |
| `TWITTER_ACCESS_TOKEN` | Twitter Access Token | ✅ 설정됨 |
| `TWITTER_ACCESS_SECRET` | Twitter Access Secret | ✅ 설정됨 |

#### 2️⃣ OpenAI API 키 발급
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 생성된 키를 복사
4. GitHub Secrets에 `OPENAI_API_KEY`로 저장

#### 3️⃣ 워크플로우 수동 실행 (테스트)
```bash
# GitHub CLI로 수동 실행
gh workflow run "🤖 Crypto Tweet Bot" --repo coindarugi/coin_darugi

# 또는 GitHub 웹에서:
# Actions → 🤖 Crypto Tweet Bot → Run workflow
```

#### 4️⃣ 실행 로그 확인
```bash
# 최근 실행 기록
gh run list --workflow="🤖 Crypto Tweet Bot" --limit 5

# 특정 실행 로그 확인
gh run view <RUN_ID> --log
```

---

## 📅 자동 실행 스케줄

- **하루 2회 자동 실행**
  - UTC 00:00 (한국 오전 9시)
  - UTC 12:00 (한국 오후 9시)

---

## 🚀 트윗 내용

5개 언어로 암호화폐 웹사이트 홍보:
- 🇰🇷 한국어
- 🇺🇸 English
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇪🇸 Español

**웹사이트:** https://crypto-darugi.com

---

## 📝 파일 구조

```
.github/workflows/
  └── scheduled-tweets.yml    # GitHub Actions 워크플로우
crypto-tweet-bot.js           # 트윗 봇 스크립트
```

---

## 🔧 로컬 테스트

```bash
# .dev.vars 파일 생성
echo "OPENAI_API_KEY=your-key" > .dev.vars
echo "TWITTER_API_KEY=your-key" >> .dev.vars
echo "TWITTER_API_SECRET=your-secret" >> .dev.vars
echo "TWITTER_ACCESS_TOKEN=your-token" >> .dev.vars
echo "TWITTER_ACCESS_SECRET=your-secret" >> .dev.vars

# 로컬 실행
node crypto-tweet-bot.js
```

---

## ⚠️ 주의사항

1. **API 키 노출 금지**: .dev.vars 파일은 .gitignore에 포함됨
2. **비용 관리**: OpenAI API 사용량 모니터링 필요
3. **트윗 제한**: Twitter API Rate Limit 준수

---

## 📞 문의

- 이메일: crypto.darugi@gmail.com
- GitHub: https://github.com/coindarugi/coin_darugi
