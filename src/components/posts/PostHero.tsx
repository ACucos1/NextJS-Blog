import type { PostDetail } from '@/lib/queries/posts'

import { PostMeta } from './PostMeta'

type Props = {
  post: PostDetail
  readingTimeMinutes: number
}

export const PostHero = ({ post, readingTimeMinutes }: Props) => {
  return (
    <header className="post-hero">
      <h1>{post.title}</h1>
      <PostMeta
        categories={post.categories}
        publishedAt={post.publishedAt}
        readingTimeMinutes={readingTimeMinutes}
      />
      {post.featuredImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={post.featuredImage.alt}
          className="post-hero__image"
          src={post.featuredImage.sizes?.hero?.url || post.featuredImage.url}
        />
      ) : null}
    </header>
  )
}
