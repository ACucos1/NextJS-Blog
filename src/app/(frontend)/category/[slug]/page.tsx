import { notFound } from 'next/navigation'

import { PostList } from '@/components/posts/PostList'
import { Container } from '@/components/ui/Container'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getPostsByCategorySlug } from '@/lib/queries/posts'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params

  const [category, posts] = await Promise.all([getCategoryBySlug(slug), getPostsByCategorySlug(slug)])

  if (!category) {
    notFound()
  }

  return (
    <Container className="category-page">
      <header className="page-header">
        <h1>{category.title}</h1>
        {category.description ? <p>{category.description}</p> : null}
      </header>

      <PostList posts={posts} />
    </Container>
  )
}
