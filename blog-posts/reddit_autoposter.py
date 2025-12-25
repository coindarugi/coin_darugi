# 🎯 Reddit Auto-Post Script
# Submit blog posts to multiple subreddits automatically

import requests
import time

# Reddit API credentials (you need to create an app at https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID = "YOUR_CLIENT_ID"
REDDIT_CLIENT_SECRET = "YOUR_CLIENT_SECRET"
REDDIT_USERNAME = "YOUR_USERNAME"
REDDIT_PASSWORD = "YOUR_PASSWORD"
USER_AGENT = "CryptoDashboard:v1.0 (by /u/YOUR_USERNAME)"

# Blog posts to share
POSTS = [
    {
        "title": "I built a free crypto dashboard that tracks 10,000+ coins with AI forecasts",
        "url": "https://crypto-dashboard-secure.pages.dev",
        "subreddit": "CryptoCurrency",
        "flair": "TRADING"
    },
    {
        "title": "Free Kimchi Premium Calculator for Korean Crypto Exchanges",
        "url": "https://crypto-dashboard-secure.pages.dev",
        "subreddit": "CryptoMarkets",
        "flair": None
    },
    {
        "title": "Real-time crypto dashboard with AI-powered price predictions",
        "url": "https://crypto-dashboard-secure.pages.dev",
        "subreddit": "Bitcoin",
        "flair": None
    },
    {
        "title": "Built a serverless crypto dashboard with Cloudflare Pages + Hono",
        "url": "https://crypto-dashboard-secure.pages.dev",
        "subreddit": "webdev",
        "flair": "Showoff Saturday"
    },
    {
        "title": "Free portfolio tracker for 10,000+ cryptocurrencies (no registration)",
        "url": "https://crypto-dashboard-secure.pages.dev",
        "subreddit": "CryptoTechnology",
        "flair": None
    }
]

def get_access_token():
    """Get Reddit OAuth access token"""
    auth = requests.auth.HTTPBasicAuth(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
    data = {
        'grant_type': 'password',
        'username': REDDIT_USERNAME,
        'password': REDDIT_PASSWORD
    }
    headers = {'User-Agent': USER_AGENT}
    
    response = requests.post(
        'https://www.reddit.com/api/v1/access_token',
        auth=auth,
        data=data,
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        print(f"Failed to get token: {response.text}")
        return None

def submit_post(token, post):
    """Submit a post to Reddit"""
    headers = {
        'Authorization': f'bearer {token}',
        'User-Agent': USER_AGENT
    }
    
    data = {
        'sr': post['subreddit'],
        'kind': 'link',
        'title': post['title'],
        'url': post['url']
    }
    
    if post['flair']:
        data['flair_id'] = post['flair']
    
    response = requests.post(
        'https://oauth.reddit.com/api/submit',
        headers=headers,
        data=data
    )
    
    if response.status_code == 200:
        result = response.json()
        if 'json' in result and 'data' in result['json']:
            post_url = result['json']['data']['url']
            print(f"✅ Posted to r/{post['subreddit']}: {post_url}")
            return True
        else:
            print(f"❌ Error posting to r/{post['subreddit']}: {result}")
            return False
    else:
        print(f"❌ Failed to post to r/{post['subreddit']}: {response.text}")
        return False

def main():
    print("🚀 Reddit Auto-Poster Starting...")
    print("=" * 50)
    
    # Get access token
    token = get_access_token()
    if not token:
        print("❌ Could not get access token. Check credentials.")
        return
    
    print(f"✅ Got access token!")
    print("=" * 50)
    
    # Post to each subreddit
    successful = 0
    for i, post in enumerate(POSTS, 1):
        print(f"\n[{i}/{len(POSTS)}] Posting to r/{post['subreddit']}...")
        
        if submit_post(token, post):
            successful += 1
        
        # Wait between posts (Reddit rate limit: ~1 post per 10 minutes)
        if i < len(POSTS):
            print(f"⏳ Waiting 10 minutes before next post...")
            time.sleep(600)  # 10 minutes
    
    print("\n" + "=" * 50)
    print(f"✅ Completed! {successful}/{len(POSTS)} posts successful")

if __name__ == "__main__":
    # WARNING: Read Reddit's rules before auto-posting!
    # - Don't spam
    # - Follow subreddit rules
    # - Space out posts (1 per day recommended)
    # - Engage with comments
    
    print("⚠️  WARNING: Auto-posting can get you banned!")
    print("⚠️  Make sure to:")
    print("   1. Read each subreddit's rules")
    print("   2. Post only 1-2 times per week")
    print("   3. Engage with comments")
    print("   4. Don't be spammy")
    print()
    
    response = input("Do you want to continue? (yes/no): ")
    if response.lower() == 'yes':
        main()
    else:
        print("❌ Cancelled")
