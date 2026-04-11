import type { Metadata } from 'next'
import Link from 'next/link'

import { PostList } from '@/components/posts/PostList'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/metadata'
import { DEFAULT_POST_PAGE_SIZE, getPaginatedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/site'

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()

  return buildMetadata({
    canonicalPath: '/blog',
    description: 'Latest writing and archived posts.',
    siteSettings,
    title: 'Blog',
    type: 'website',
  })
}

export default async function BlogPage() {
  const posts = await getPaginatedPosts(1, DEFAULT_POST_PAGE_SIZE)

  return (
    <Container className="blog-page">
      <header className="page-header">
        <h1>Blog</h1>
        <p>Latest writing and archived posts.</p>
      </header>

      <PostList posts={posts.docs} />

      {posts.totalPages > 1 ? (
        <nav aria-label="Pagination" className="pagination">
          <span>
            Page {posts.page} of {posts.totalPages}
          </span>
          <Link href="/blog/page/2">Next page</Link>
        </nav>
      ) : null}
    </Container>
  )
}
