import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostHero } from '@/components/posts/PostHero'
import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/metadata'
import { getPostBySlug } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/site'
import { getReadingTimeMinutes } from '@/lib/readingTime'
import { buildPostPath } from '@/lib/routes'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params

  const [post, siteSettings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])

  if (!post) {
    return buildMetadata({
      canonicalPath: buildPostPath(slug),
      noIndex: true,
      siteSettings,
      title: 'Post not found',
    })
  }

  return buildMetadata({
    canonicalPath: buildPostPath(post.slug),
    canonicalURL: post.seo?.canonicalURL,
    description: post.seo?.description || post.excerpt,
    image: post.seo?.image || post.featuredImage,
    siteSettings,
    title: post.seo?.title || post.title,
    type: 'article',
  })
}

export default async function PostPage(props: Props) {
  const { slug } = await props.params

  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <Container className="post-page">
      <PostHero post={post} readingTimeMinutes={getReadingTimeMinutes(post.content)} />
      <RichText className="post-content" content={post.content} />
    </Container>
  )
}
