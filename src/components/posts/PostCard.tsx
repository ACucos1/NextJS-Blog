import Link from 'next/link'

import type { PostPreview } from '@/lib/queries/posts'

import { PostMeta } from './PostMeta'

type Props = {
  post: PostPreview
}

export const PostCard = ({ post }: Props) => {
  return (
    <article className="post-card">
      {post.featuredImage?.url ? (
        <Link href={`/blog/${post.slug}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={post.featuredImage.alt}
            className="post-card__image"
            loading="lazy"
            src={post.featuredImage.sizes?.card?.url || post.featuredImage.url}
          />
        </Link>
      ) : null}

      <div className="post-card__body">
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <PostMeta categories={post.categories} publishedAt={post.publishedAt} />

        <p>{post.excerpt}</p>
      </div>
    </article>
  )
}
