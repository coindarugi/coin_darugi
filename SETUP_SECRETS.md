# 🔐 GitHub Secrets 설정 가이드

## 📍 설정 위치
https://github.com/coindarugi/coin_darugi/settings/secrets/actions

## ✅ 설정할 5개 Secret

### 1. TWITTER_API_KEY
```
[Your Twitter API Key from X Developer Portal]
```

### 2. TWITTER_API_SECRET
```
[Your Twitter API Secret from X Developer Portal]
```

### 3. TWITTER_ACCESS_TOKEN
```
[Your Twitter Access Token from X Developer Portal]
```

### 4. TWITTER_ACCESS_SECRET
```
[Your Twitter Access Secret from X Developer Portal]
```

### 5. OPENAI_API_KEY
```
[Your OpenAI API Key starting with sk-...]
```

**⚠️ IMPORTANT: These are sensitive credentials!**
- Never commit actual API keys to GitHub
- Use these placeholders only
- Add real values directly in GitHub Settings → Secrets

## 📝 설정 방법

1. 위 링크 클릭
2. **New repository secret** 버튼 클릭
3. Name에 Secret 이름 입력 (예: TWITTER_API_KEY)
4. Secret에 위 값 복사해서 붙여넣기
5. **Add secret** 클릭
6. 총 5개 반복

## ✅ 설정 완료 후

- Actions 탭으로 이동
- "🤖 Crypto Tweet Bot" 클릭
- **Run workflow** 버튼으로 수동 테스트

## 🕐 자동 실행

설정 완료 후:
- 매일 오전 9시 (한국 시간)
- 매일 오후 9시 (한국 시간)
- 자동으로 5개 언어 트윗 발행!
