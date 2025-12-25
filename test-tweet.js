import { TwitterApi } from 'twitter-api-v2';
import { readFileSync } from 'fs';

// .dev.vars 파일 읽기 (dotenv 형식)
const envContent = readFileSync('.dev.vars', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// X API 클라이언트 생성
const client = new TwitterApi({
  appKey: envVars.TWITTER_API_KEY,
  appSecret: envVars.TWITTER_API_SECRET,
  accessToken: envVars.TWITTER_ACCESS_TOKEN,
  accessSecret: envVars.TWITTER_ACCESS_SECRET,
});

// 읽기/쓰기 가능한 클라이언트
const rwClient = client.readWrite;

async function testTweet() {
  try {
    console.log('🚀 X API 연결 테스트 시작...\n');

    // 1. 사용자 정보 확인
    console.log('1️⃣ 인증된 사용자 정보 확인 중...');
    const me = await rwClient.v2.me();
    console.log(`✅ 인증 성공! @${me.data.username} (${me.data.name})\n`);

    // 2. 테스트 트윗 발행
    const tweetText = `🧪 API 테스트 중입니다!\n\n현재 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n\n#테스트 #XAPI`;
    
    console.log('2️⃣ 테스트 트윗 발행 중...');
    console.log(`내용: ${tweetText}\n`);

    const tweet = await rwClient.v2.tweet(tweetText);
    
    console.log('✅ 트윗 성공!');
    console.log(`트윗 ID: ${tweet.data.id}`);
    console.log(`트윗 링크: https://twitter.com/${me.data.username}/status/${tweet.data.id}\n`);

    console.log('🎉 모든 테스트 완료! X API가 정상 작동합니다.');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    
    if (error.code === 403) {
      console.error('\n⚠️ 권한 오류: X Developer Portal에서 앱 권한을 "Read and Write"로 설정했는지 확인하세요.');
    } else if (error.code === 401) {
      console.error('\n⚠️ 인증 오류: API 키와 토큰이 올바른지 확인하세요.');
    } else if (error.data) {
      console.error('\n상세 정보:', JSON.stringify(error.data, null, 2));
    }
  }
}

testTweet();
