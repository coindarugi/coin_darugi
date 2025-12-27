// 블로그 포스트 데이터
export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
  tags: string[]
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: '2025-crypto-investment-guide',
    title: '2026년 암호화폐 투자 완벽 가이드',
    description: '2025년 비트코인 ETF 승인과 반감기 이후, 2026년 암호화폐 시장 전망과 실전 투자 전략',
    date: '2025-12-27',
    readTime: '10분',
    category: '투자 가이드',
    tags: ['비트코인', '투자전략', 'ETF', '반감기'],
    content: `# 2026년 암호화폐 투자 완벽 가이드

작성 중...`
  }
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts
}
