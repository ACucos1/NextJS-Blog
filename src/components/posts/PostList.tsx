import type { PostPreview } from '@/lib/queries/posts'

import { PostCard } from './PostCard'

type Props = {
  posts: PostPreview[]
}

export const PostList = ({ posts }: Props) => {
  if (posts.length === 0) {
    return <p className="empty-state">No posts yet.</p>
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
