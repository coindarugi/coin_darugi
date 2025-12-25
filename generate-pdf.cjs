const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>암호화폐 실시간 대시보드 - 접속 정보</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 40px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .container {
      background: white;
      border-radius: 24px;
      padding: 50px 45px;
      max-width: 650px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      text-align: center;
      margin-bottom: 45px;
      border-bottom: 3px solid #667eea;
      padding-bottom: 30px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 18px;
      color: #667eea;
      font-weight: 500;
    }
    
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 30px 0;
    }
    
    .info-section {
      margin-bottom: 32px;
    }
    
    .info-section .label {
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
    }
    
    .info-section .label .icon {
      font-size: 24px;
      margin-right: 10px;
      width: 32px;
      text-align: center;
    }
    
    .info-section .value {
      background: #f7fafc;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 16px;
      color: #4a5568;
      border-left: 4px solid #667eea;
      margin-left: 42px;
    }
    
    .features {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 25px;
      border-radius: 16px;
      margin-bottom: 32px;
    }
    
    .features .title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
    }
    
    .features .title .icon {
      margin-right: 10px;
      font-size: 24px;
    }
    
    .features ul {
      list-style: none;
    }
    
    .features li {
      padding: 10px 0;
      color: #4a5568;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
    
    .features li:before {
      content: "•";
      color: #667eea;
      font-size: 24px;
      margin-right: 12px;
      font-weight: bold;
    }
    
    .contact {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 16px;
      text-align: center;
    }
    
    .contact .title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .contact .title .icon {
      margin-right: 10px;
      font-size: 24px;
    }
    
    .contact .text {
      font-size: 16px;
      opacity: 0.95;
    }
    
    .footer {
      text-align: center;
      margin-top: 35px;
      padding-top: 25px;
      border-top: 2px solid #e2e8f0;
      color: #718096;
      font-size: 14px;
    }
    
    .highlight {
      color: #667eea;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>암호화폐 실시간 대시보드</h1>
      <div class="subtitle">고객 전용 접속 정보</div>
    </div>
    
    <div class="info-section">
      <div class="label">
        <span class="icon">🌐</span>
        접속 URL
      </div>
      <div class="value">
        구매 후 24시간 내 개별 발급
      </div>
    </div>
    
    <div class="info-section">
      <div class="label">
        <span class="icon">🔑</span>
        비밀번호
      </div>
      <div class="value">
        고객님이 원하시는 비밀번호로 설정
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="features">
      <div class="title">
        <span class="icon">✨</span>
        주요 기능
      </div>
      <ul>
        <li>10,000+ 코인 실시간 추적</li>
        <li>김치 프리미엄 계산</li>
        <li>포트폴리오 관리</li>
        <li>실시간 뉴스 번역</li>
      </ul>
    </div>
    
    <div class="contact">
      <div class="title">
        <span class="icon">📞</span>
        문의
      </div>
      <div class="text">
        크몽 채팅으로 연락주세요
      </div>
    </div>
    
    <div class="footer">
      구매해주셔서 감사합니다 🙏
    </div>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const outputPath = path.join(__dirname, '암호화폐대시보드_접속정보.pdf');
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
  
  console.log(`PDF 생성 완료: ${outputPath}`);
  return outputPath;
}

generatePDF().catch(console.error);
