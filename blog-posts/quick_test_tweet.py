#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick Test Tweet - Post one tweet right now!
"""

import tweepy

# Your credentials (already filled in!)
API_KEY = "jnDgvVil9JVag4TXOAGaw2I5O"
API_SECRET = "IaAnWQVQjQ03Bzsz1a6JhFBM2PeEc4xCTgeugJs94H1jTNubCu"
ACCESS_TOKEN = "2004081797093806080-5yKahSFcgFGs2yTdAlahM5PpkFTuVl"
ACCESS_TOKEN_SECRET = "iGI83eKHGXG2mUxT0WzlEnjMl90nTmGRE8FEGHdhoRbMx"

# Test tweet
TEST_TWEET = """🚀 Just launched my free crypto dashboard!

✨ Features:
• 10,000+ coins tracked
• AI-powered forecasts 🤖
• 30-second updates ⚡
• Portfolio management 💰
• 5 languages 🌍

100% FREE, no registration!

👉 https://crypto-dashboard-secure.pages.dev

#crypto #bitcoin #ethereum"""

def post_test_tweet():
    """Post a test tweet"""
    print("🐦 Quick Test Tweet")
    print("=" * 60)
    
    # Authenticate
    client = tweepy.Client(
        consumer_key=API_KEY,
        consumer_secret=API_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_TOKEN_SECRET
    )
    
    # Preview
    print("\n📄 Tweet Preview:")
    print("=" * 60)
    print(TEST_TWEET)
    print("=" * 60)
    
    # Confirm
    print("\n⚠️  This will post to your Twitter account!")
    confirm = input("Post this tweet? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("❌ Cancelled")
        return
    
    try:
        # Post tweet
        response = client.create_tweet(text=TEST_TWEET)
        tweet_id = response.data['id']
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Tweet posted!")
        print("=" * 60)
        print(f"🔗 URL: https://twitter.com/coin_darugi/status/{tweet_id}")
        print("=" * 60)
        print("\n🎉 Check your Twitter to see the tweet!")
        print("👀 URL 클릭해서 확인해봐!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    post_test_tweet()
