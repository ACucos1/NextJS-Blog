import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { PostList } from '@/components/posts/PostList'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/metadata'
import { DEFAULT_POST_PAGE_SIZE, getPaginatedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/site'

type Props = {
  params: Promise<{
    pageNumber: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [{ pageNumber }, siteSettings] = await Promise.all([props.params, getSiteSettings()])
  const parsedPage = Number.parseInt(pageNumber, 10)

  if (!Number.isFinite(parsedPage) || parsedPage <= 1) {
    return buildMetadata({
      canonicalPath: '/blog',
      description: 'Latest writing and archived posts.',
      siteSettings,
      title: 'Blog',
      type: 'website',
    })
  }

  return buildMetadata({
    canonicalPath: `/blog/page/${parsedPage}`,
    description: `Blog archive page ${parsedPage}.`,
    siteSettings,
    title: `Blog — Page ${parsedPage}`,
    type: 'website',
  })
}

export default async function BlogPageNumber(props: Props) {
  const { pageNumber } = await props.params
  const parsedPage = Number.parseInt(pageNumber, 10)

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    notFound()
  }

  if (parsedPage === 1) {
    redirect('/blog')
  }

  const posts = await getPaginatedPosts(parsedPage, DEFAULT_POST_PAGE_SIZE)

  if (posts.docs.length === 0 && parsedPage > posts.totalPages) {
    notFound()
  }

  const currentPage = posts.page ?? parsedPage

  return (
    <Container className="blog-page">
      <header className="page-header">
        <h1>Blog</h1>
        <p>Page {currentPage}</p>
      </header>

      <PostList posts={posts.docs} />

      <nav aria-label="Pagination" className="pagination">
        <span>
          Page {currentPage} of {posts.totalPages}
        </span>

        <div className="pagination__links">
          {posts.hasPrevPage ? (
            <Link href={currentPage - 1 === 1 ? '/blog' : `/blog/page/${currentPage - 1}`}>
              Previous
            </Link>
          ) : null}
          {posts.hasNextPage ? <Link href={`/blog/page/${currentPage + 1}`}>Next</Link> : null}
        </div>
      </nav>
    </Container>
  )
}
