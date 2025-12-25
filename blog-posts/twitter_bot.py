#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Twitter Auto-Poster for Crypto Dashboard
Automatically posts promotional tweets at optimal times
"""

import tweepy
import time
from datetime import datetime
import random

# ============================================
# Twitter API Credentials
# Get these from: https://developer.twitter.com/en/portal/dashboard
# ============================================
API_KEY = "jnDgvVil9JVag4TXOAGaw2I5O"
API_SECRET = "IaAnWQVQjQ03Bzsz1a6JhFBM2PeEc4xCTgeugJs94H1jTNubCu"
ACCESS_TOKEN = "2004081797093806080-5yKahSFcgFGs2yTdAlahM5PpkFTuVl"
ACCESS_TOKEN_SECRET = "iGI83eKHGXG2mUxT0WzlEnjMl90nTmGRE8FEGHdhoRbMx"

# ============================================
# Tweet Templates
# ============================================
TWEETS = [
    # Feature-focused tweets
    {
        "text": """🚀 Track 10,000+ cryptocurrencies in real-time!

✨ Features:
• AI-powered forecasts 🤖
• 30-second updates ⚡
• Portfolio tracking 💰
• Kimchi premium 🇰🇷
• 5 languages 🌍

100% FREE, no registration!

👉 https://crypto-dashboard-secure.pages.dev

#crypto #bitcoin #ethereum""",
        "media": None
    },
    
    # AI Forecast tweet
    {
        "text": """🤖 AI-Powered Crypto Forecasts!

Get 1-week price predictions with:
• Confidence levels 📊
• Detailed reasoning 📝
• Investment advice 💡
• Real-time updates ⚡

Try it FREE:
https://crypto-dashboard-secure.pages.dev

#AI #crypto #bitcoin #trading""",
        "media": None
    },
    
    # Kimchi Premium tweet
    {
        "text": """🇰🇷 Kimchi Premium Calculator!

Compare Korean exchanges instantly:
• Upbit 🟣
• Bithumb 🔵
• Coinone 🟢

Spot arbitrage opportunities in real-time!

FREE tool:
https://crypto-dashboard-secure.pages.dev

#KimchiPremium #crypto #Korea""",
        "media": None
    },
    
    # Portfolio Management tweet
    {
        "text": """💰 Free Crypto Portfolio Tracker!

✅ Real-time profit/loss
✅ Auto-calculate returns
✅ Track 10,000+ coins
✅ No registration needed
✅ Privacy-focused

Start tracking:
https://crypto-dashboard-secure.pages.dev

#portfolio #crypto #investment""",
        "media": None
    },
    
    # Speed/Performance tweet
    {
        "text": """⚡ Fastest crypto dashboard?

Updates every 30 SECONDS! 🔥

While others update every 5 minutes, we keep you ahead of the market.

Perfect for day traders! 📈

Try the speed:
https://crypto-dashboard-secure.pages.dev

#daytrading #crypto #bitcoin""",
        "media": None
    },
    
    # Multi-language tweet
    {
        "text": """🌍 Crypto Dashboard in YOUR language!

🇰🇷 한국어
🇺🇸 English
🇫🇷 Français
🇩🇪 Deutsch
🇪🇸 Español

No matter where you are, track crypto in your native language!

https://crypto-dashboard-secure.pages.dev

#crypto #multilingual""",
        "media": None
    },
    
    # Free & Privacy tweet
    {
        "text": """🔒 Privacy-First Crypto Tracker

✅ No registration
✅ No email required
✅ No data collection
✅ 100% FREE forever

Your portfolio, your privacy.

Start now:
https://crypto-dashboard-secure.pages.dev

#privacy #crypto #bitcoin""",
        "media": None
    },
    
    # Technical/Developer tweet
    {
        "text": """⚡ Built with cutting-edge tech:

• Hono Framework 🔥
• Cloudflare Workers 🌐
• Edge Computing 📡
• <100ms latency worldwide 🚀

Check out the tech:
https://crypto-dashboard-secure.pages.dev

#webdev #serverless #cloudflare""",
        "media": None
    },
    
    # Comparison tweet
    {
        "text": """🆚 Why choose us?

❌ Others: Login required
✅ Us: Instant access

❌ Others: 5min updates
✅ Us: 30sec updates

❌ Others: Limited coins
✅ Us: 10,000+ coins

❌ Others: $$$
✅ Us: FREE!

https://crypto-dashboard-secure.pages.dev

#crypto""",
        "media": None
    },
    
    # Community/Engagement tweet
    {
        "text": """📊 What crypto feature do YOU want next?

🅰️ Price alerts
🅱️ Mobile app
🅲️ More exchanges
🅳️ Trading signals

Reply below! 👇

Current features:
https://crypto-dashboard-secure.pages.dev

#crypto #bitcoin #community""",
        "media": None
    },
    
    # Short & punchy tweets
    {
        "text": """Track Bitcoin, Ethereum, and 10,000+ cryptos.

Free. Fast. No BS.

https://crypto-dashboard-secure.pages.dev

#crypto #bitcoin""",
        "media": None
    },
    
    {
        "text": """AI predicts crypto prices.
You make profit.

Simple.

https://crypto-dashboard-secure.pages.dev

#AI #crypto #trading""",
        "media": None
    },
    
    # Korean market focus
    {
        "text": """🇰🇷 한국 트레이더를 위한 기능!

• 업비트 실시간 시세
• 빗썸 가격 비교
• 김치 프리미엄 계산
• 한국어 완벽 지원

무료로 시작:
https://crypto-dashboard-secure.pages.dev

#암호화폐 #비트코인 #업비트""",
        "media": None
    },
    
    # Stats/Numbers tweet
    {
        "text": """📊 Dashboard Stats:

🪙 10,000+ coins tracked
⚡ 30-second updates
🌍 5 languages
🤖 AI-powered forecasts
💰 100% FREE
🔒 Zero registration

Join thousands of users:
https://crypto-dashboard-secure.pages.dev

#crypto""",
        "media": None
    },
    
    # Problem/Solution tweet
    {
        "text": """Tired of slow crypto trackers? 😩

We update every 30 seconds! ⚡

Tired of complicated interfaces? 😵

Ours is clean & simple! ✨

Tired of paying for features? 💸

We're 100% FREE! 🎉

https://crypto-dashboard-secure.pages.dev""",
        "media": None
    }
]

# ============================================
# Best Times to Tweet (PST)
# Based on crypto market activity
# ============================================
OPTIMAL_HOURS = [
    6,   # 6 AM - Asian markets opening
    9,   # 9 AM - European markets
    12,  # 12 PM - US East Coast lunch
    15,  # 3 PM - US markets active
    18,  # 6 PM - After work crowd
    21   # 9 PM - Evening traders
]

# ============================================
# Functions
# ============================================

def authenticate_twitter():
    """Authenticate with Twitter API v2"""
    try:
        client = tweepy.Client(
            consumer_key=API_KEY,
            consumer_secret=API_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_TOKEN_SECRET
        )
        
        # Test authentication
        me = client.get_me()
        print(f"✅ Authenticated as: @{me.data.username}")
        return client
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None

def post_tweet(client, tweet_data):
    """Post a single tweet"""
    try:
        response = client.create_tweet(text=tweet_data["text"])
        tweet_id = response.data['id']
        print(f"✅ Tweet posted! ID: {tweet_id}")
        print(f"   URL: https://twitter.com/user/status/{tweet_id}")
        return True
    except Exception as e:
        print(f"❌ Failed to post tweet: {e}")
        return False

def should_tweet_now():
    """Check if current time is optimal for tweeting"""
    current_hour = datetime.now().hour
    return current_hour in OPTIMAL_HOURS

def auto_tweet_schedule():
    """Automatically tweet at optimal times"""
    print("🤖 Twitter Auto-Poster Started!")
    print("=" * 60)
    print(f"📅 Optimal hours (PST): {OPTIMAL_HOURS}")
    print(f"📝 Total tweets ready: {len(TWEETS)}")
    print("=" * 60)
    
    # Authenticate
    client = authenticate_twitter()
    if not client:
        return
    
    tweet_index = 0
    posted_today = 0
    MAX_TWEETS_PER_DAY = 5
    
    print(f"\n⏰ Waiting for optimal time...")
    print(f"📊 Daily limit: {MAX_TWEETS_PER_DAY} tweets/day")
    
    while True:
        try:
            current_time = datetime.now()
            
            # Reset daily counter at midnight
            if current_time.hour == 0 and current_time.minute == 0:
                posted_today = 0
                print(f"\n🔄 Daily counter reset!")
            
            # Check if we should tweet now
            if should_tweet_now() and posted_today < MAX_TWEETS_PER_DAY:
                print(f"\n⏰ {current_time.strftime('%Y-%m-%d %H:%M:%S')} - Optimal time!")
                
                # Select tweet
                tweet = TWEETS[tweet_index % len(TWEETS)]
                
                # Post tweet
                if post_tweet(client, tweet):
                    posted_today += 1
                    tweet_index += 1
                    
                    print(f"📊 Progress: {posted_today}/{MAX_TWEETS_PER_DAY} tweets today")
                    print(f"📝 Next tweet: #{tweet_index % len(TWEETS) + 1}")
                    
                    # Wait 2 hours before next tweet
                    wait_time = 2 * 60 * 60
                    print(f"⏳ Waiting 2 hours before next tweet...")
                    time.sleep(wait_time)
                else:
                    # If failed, wait 1 hour and retry
                    print("⏳ Waiting 1 hour before retry...")
                    time.sleep(60 * 60)
            else:
                # Check every 10 minutes
                time.sleep(10 * 60)
                
        except KeyboardInterrupt:
            print("\n\n⚠️  Stopped by user!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            print("⏳ Waiting 1 hour before retry...")
            time.sleep(60 * 60)

def manual_tweet():
    """Post a single tweet manually (for testing)"""
    print("🐦 Manual Tweet Mode")
    print("=" * 60)
    
    # Authenticate
    client = authenticate_twitter()
    if not client:
        return
    
    # Show available tweets
    print("\n📝 Available tweets:\n")
    for i, tweet in enumerate(TWEETS, 1):
        preview = tweet["text"][:60].replace("\n", " ")
        print(f"{i}. {preview}...")
    
    # Select tweet
    print(f"\n{len(TWEETS) + 1}. 🎲 Random tweet")
    print(f"{len(TWEETS) + 2}. ✏️  Custom tweet")
    
    try:
        choice = int(input(f"\nSelect tweet (1-{len(TWEETS) + 2}): "))
        
        if choice == len(TWEETS) + 1:
            # Random
            tweet = random.choice(TWEETS)
            print("\n🎲 Random tweet selected!")
        elif choice == len(TWEETS) + 2:
            # Custom
            text = input("\n✏️  Enter your tweet:\n")
            tweet = {"text": text, "media": None}
        else:
            tweet = TWEETS[choice - 1]
        
        # Preview
        print("\n" + "=" * 60)
        print("📄 Preview:")
        print("=" * 60)
        print(tweet["text"])
        print("=" * 60)
        
        # Confirm
        confirm = input("\n✅ Post this tweet? (y/n): ")
        if confirm.lower() == 'y':
            post_tweet(client, tweet)
        else:
            print("❌ Cancelled")
            
    except (ValueError, IndexError):
        print("❌ Invalid selection")

def main():
    """Main menu"""
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🐦 Twitter Auto-Poster for Crypto Dashboard      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Select mode:

1. 🤖 Auto-Tweet (scheduled, optimal times)
2. ✋ Manual Tweet (post one now)
3. 📊 Show Tweet Stats
4. ❌ Exit

""")
    
    choice = input("Enter your choice (1-4): ")
    
    if choice == "1":
        print("\n⚠️  Auto-tweet will run continuously!")
        print("⚠️  Press Ctrl+C to stop")
        confirm = input("\nContinue? (y/n): ")
        if confirm.lower() == 'y':
            auto_tweet_schedule()
    elif choice == "2":
        manual_tweet()
    elif choice == "3":
        print(f"\n📊 Tweet Statistics:")
        print(f"   Total tweets ready: {len(TWEETS)}")
        print(f"   Optimal hours: {len(OPTIMAL_HOURS)} per day")
        print(f"   Max tweets/day: 5")
        print(f"   Estimated reach: 500-5,000 impressions/day")
    else:
        print("👋 Goodbye!")

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║                     IMPORTANT NOTES                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  1. Get Twitter API keys from:                          ║
║     https://developer.twitter.com/en/portal/dashboard   ║
║                                                          ║
║  2. Free tier limits:                                   ║
║     • 1,500 tweets/month                                ║
║     • 50 tweets/day                                     ║
║                                                          ║
║  3. Best practices:                                     ║
║     • Don't spam (max 5 tweets/day recommended)        ║
║     • Engage with replies                              ║
║     • Mix promotional with valuable content            ║
║                                                          ║
║  4. This bot posts every 2 hours during optimal times   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
""")
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user. Goodbye!")
