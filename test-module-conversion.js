#!/usr/bin/env node
/**
 * Test script to verify ES Module conversion
 * This test imports the crypto-tweet-bot module and tests exported functions
 */

import { buildLanguageUrl, generateTweet } from './crypto-tweet-bot.js';

console.log('🧪 Testing ES Module imports...\n');

// Test 1: buildLanguageUrl function
console.log('Test 1: buildLanguageUrl function');
try {
  const koreanUrl = buildLanguageUrl('https://coindarugi.com', 'ko');
  console.log(`  Korean URL: ${koreanUrl}`);
  if (koreanUrl !== 'https://coindarugi.com') {
    throw new Error('Korean URL should be base URL without lang parameter');
  }

  const englishUrl = buildLanguageUrl('https://coindarugi.com', 'en');
  console.log(`  English URL: ${englishUrl}`);
  if (englishUrl !== 'https://coindarugi.com?lang=en') {
    throw new Error('English URL should have lang parameter');
  }

  const chineseUrl = buildLanguageUrl('https://coindarugi.com', 'zh');
  console.log(`  Chinese URL: ${chineseUrl}`);
  if (chineseUrl !== 'https://coindarugi.com?lang=zh') {
    throw new Error('Chinese URL should have lang parameter');
  }

  console.log('  ✅ buildLanguageUrl tests passed!\n');
} catch (error) {
  console.error('  ❌ buildLanguageUrl test failed:', error.message);
  process.exit(1);
}

// Test 2: generateTweet function
console.log('Test 2: generateTweet function');
try {
  const mockData = {
    bitcoin: {
      usd: 50000,
      usd_24h_change: 2.5
    },
    ethereum: {
      usd: 3000,
      usd_24h_change: -1.2
    }
  };

  const koreanTweet = generateTweet(mockData, 'ko');
  console.log('  Korean tweet generated successfully');
  if (!koreanTweet.includes('비트코인')) {
    throw new Error('Korean tweet should contain Korean text');
  }
  if (!koreanTweet.includes('https://coindarugi.com')) {
    throw new Error('Korean tweet should contain base URL');
  }
  if (koreanTweet.includes('?lang=')) {
    throw new Error('Korean tweet should not have lang parameter');
  }

  const englishTweet = generateTweet(mockData, 'en');
  console.log('  English tweet generated successfully');
  if (!englishTweet.includes('Bitcoin')) {
    throw new Error('English tweet should contain English text');
  }
  if (!englishTweet.includes('?lang=en')) {
    throw new Error('English tweet should have lang parameter');
  }

  const chineseTweet = generateTweet(mockData, 'zh');
  console.log('  Chinese tweet generated successfully');
  if (!chineseTweet.includes('比特币')) {
    throw new Error('Chinese tweet should contain Chinese text');
  }
  if (!chineseTweet.includes('?lang=zh')) {
    throw new Error('Chinese tweet should have lang parameter');
  }

  console.log('  ✅ generateTweet tests passed!\n');
} catch (error) {
  console.error('  ❌ generateTweet test failed:', error.message);
  process.exit(1);
}

console.log('🎉 All tests passed! ES Module conversion is successful!');
console.log('   The crypto-tweet-bot.js file can now be used as an ES Module.');
