import { notFound } from 'next/navigation'

import { PostHero } from '@/components/posts/PostHero'
import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { getPostBySlug } from '@/lib/queries/posts'
import { getReadingTimeMinutes } from '@/lib/readingTime'

type Props = {
  params: Promise<{
    slug: string
  }>
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
