import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/posts/PostList'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/metadata'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getPostsByCategorySlug } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/site'
import { buildCategoryPath } from '@/lib/routes'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params

  const [category, siteSettings] = await Promise.all([getCategoryBySlug(slug), getSiteSettings()])

  if (!category) {
    return buildMetadata({
      canonicalPath: buildCategoryPath(slug),
      noIndex: true,
      siteSettings,
      title: 'Category not found',
    })
  }

  return buildMetadata({
    canonicalPath: buildCategoryPath(category.slug),
    description: category.description || `Posts filed under ${category.title}.`,
    siteSettings,
    title: category.title,
  })
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
