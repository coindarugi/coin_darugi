#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('[STEP 1] Starting Twitter bot script at', new Date().toISOString());

// Get API keys from environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

console.log('[STEP 2] Retrieved environment variables');
console.log('  - TWITTER_API_KEY:', TWITTER_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('  - TWITTER_API_SECRET:', TWITTER_API_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('  - TWITTER_ACCESS_TOKEN:', TWITTER_ACCESS_TOKEN ? '✓ Loaded' : '✗ Missing');
console.log('  - TWITTER_ACCESS_SECRET:', TWITTER_ACCESS_SECRET ? '✓ Loaded' : '✗ Missing');

// Validate that we have all required keys
if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
  console.error('[ERROR] Missing required Twitter API credentials');
  console.error('  Required environment variables:');
  console.error('  - TWITTER_API_KEY');
  console.error('  - TWITTER_API_SECRET');
  console.error('  - TWITTER_ACCESS_TOKEN');
  console.error('  - TWITTER_ACCESS_SECRET');
  process.exit(1);
}

console.log('[STEP 3] All required API keys are present');

try {
  console.log('[STEP 4] Attempting to fetch kimchi premium data...');
  const result = execSync('npm run fetch-kimchi-data', { encoding: 'utf-8' });
  console.log('[STEP 5] Successfully fetched kimchi premium data');
  console.log('[STEP 5] Data fetch output:', result.substring(0, 500)); // Log first 500 chars
  
  console.log('[STEP 6] Attempting to post tweet about kimchi premium...');
  try {
    const tweetResult = execSync('npm run post-kimchi-tweet', { encoding: 'utf-8' });
    console.log('[STEP 7] Successfully posted kimchi premium tweet');
    console.log('[STEP 7] Tweet result:', tweetResult.substring(0, 500));
  } catch (tweetError) {
    console.error('[ERROR] Failed to post kimchi premium tweet');
    console.error('[ERROR] Tweet error code:', tweetError.code);
    console.error('[ERROR] Tweet error message:', tweetError.message);
    console.error('[ERROR] Tweet error output:', tweetError.stdout || 'No stdout');
    console.error('[ERROR] Tweet error stderr:', tweetError.stderr || 'No stderr');
    throw tweetError;
  }

  console.log('[STEP 8] Attempting to post daily market tweet...');
  try {
    const dailyResult = execSync('npm run post-daily-tweet', { encoding: 'utf-8' });
    console.log('[STEP 9] Successfully posted daily market tweet');
    console.log('[STEP 9] Daily tweet result:', dailyResult.substring(0, 500));
  } catch (dailyError) {
    console.error('[ERROR] Failed to post daily market tweet');
    console.error('[ERROR] Daily error code:', dailyError.code);
    console.error('[ERROR] Daily error message:', dailyError.message);
    console.error('[ERROR] Daily error output:', dailyError.stdout || 'No stdout');
    console.error('[ERROR] Daily error stderr:', dailyError.stderr || 'No stderr');
    throw dailyError;
  }

  console.log('[STEP 10] All tasks completed successfully!');
  console.log('[COMPLETE] Twitter bot script finished at', new Date().toISOString());
  process.exit(0);

} catch (error) {
  console.error('[FATAL ERROR] Script execution failed');
  console.error('  - Error code:', error.code);
  console.error('  - Error message:', error.message);
  console.error('  - Error signal:', error.signal);
  console.error('  - Stack trace:', error.stack);
  console.error('  - Full error object:', JSON.stringify(error, null, 2));
  console.error('[FATAL] Exiting with code 1 at', new Date().toISOString());
  process.exit(1);
}
