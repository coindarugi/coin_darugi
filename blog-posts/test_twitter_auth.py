#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Twitter API Test - Check if credentials work
"""

import tweepy

# ============================================
# 여기에 너의 키 4개 넣기!
# ============================================
API_KEY = "jnDgvVil9JVag4TXOAGaw2I5O"
API_SECRET = "IaAnWQVQjQ03Bzsz1a6JhFBM2PeEc4xCTgeugJs94H1jTNubCu"
ACCESS_TOKEN = "2004081797093806080-5yKahSFcgFGs2yTdAlahM5PpkFTuVl"
ACCESS_TOKEN_SECRET = "iGI83eKHGXG2mUxT0WzlEnjMl90nTmGRE8FEGHdhoRbMx"

# ============================================
# Test Authentication
# ============================================
def test_auth():
    """Test if Twitter API credentials work"""
    print("🐦 Testing Twitter API credentials...")
    print("=" * 60)
    
    try:
        # Try to authenticate
        client = tweepy.Client(
            consumer_key=API_KEY,
            consumer_secret=API_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_TOKEN_SECRET
        )
        
        # Get user info
        me = client.get_me()
        
        print("✅ SUCCESS! Authentication works!")
        print("=" * 60)
        print(f"🎉 Connected to Twitter account:")
        print(f"   Username: @{me.data.username}")
        print(f"   Name: {me.data.name}")
        print(f"   ID: {me.data.id}")
        print("=" * 60)
        print("\n✨ You're ready to start tweeting!")
        print("   Run: python3 twitter_bot.py")
        
        return True
        
    except tweepy.errors.Unauthorized as e:
        print("❌ AUTHENTICATION FAILED!")
        print("=" * 60)
        print("🔍 Common issues:")
        print("   1. Wrong API keys - double check all 4 keys")
        print("   2. App permissions not set to 'Read and Write'")
        print("   3. Keys regenerated (old keys won't work)")
        print("=" * 60)
        print(f"📝 Error details: {e}")
        return False
        
    except Exception as e:
        print("❌ ERROR!")
        print("=" * 60)
        print(f"📝 Error: {e}")
        print("=" * 60)
        return False

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║           🐦 Twitter API Credentials Test               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

This will test if your Twitter API keys are correct.

BEFORE RUNNING:
1. Fill in all 4 API keys above (lines 11-14)
2. Make sure your app has 'Read and Write' permissions
3. Save this file

""")
    
    input("Press ENTER to test your credentials...")
    print()
    
    test_auth()
