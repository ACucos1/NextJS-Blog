import { getRecentPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/site'
import { buildPostPath } from '@/lib/routes'
import { getSiteURL, toAbsoluteURL } from '@/lib/metadata'

const escapeXML = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const dynamic = 'force-static'

export const GET = async () => {
  const [siteSettings, posts] = await Promise.all([
    getSiteSettings(),
    getRecentPosts({
      limit: 100,
    }),
  ])

  const siteURL = getSiteURL()
  const siteTitle = siteSettings?.siteName || 'My Blog'
  const siteDescription = siteSettings?.defaultMetaDescription || 'Personal blog'

  const items = posts
    .map((post) => {
      const url = toAbsoluteURL(buildPostPath(post.slug))

      return `
        <item>
          <title>${escapeXML(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <description>${escapeXML(post.excerpt)}</description>
          ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
        </item>
      `.trim()
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(siteTitle)}</title>
    <link>${siteURL}</link>
    <description>${escapeXML(siteDescription)}</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'content-type': 'application/rss+xml; charset=utf-8',
    },
  })
}
