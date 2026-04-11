import type { Category, Media, Post } from '@/payload-types'

import { getPayloadClient } from '@/lib/payload'

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getPopulatedMedia = (value: Post['featuredImage']): Media | null => {
  if (!value || !isObject(value)) {
    return null
  }

  if (!('url' in value)) {
    return null
  }

  return value as Media
}

const getPopulatedCategories = (categories: Post['categories']): Category[] => {
  if (!Array.isArray(categories)) {
    return []
  }

  return categories.filter((category): category is Category => isObject(category) && 'slug' in category)
}

export type PostPreview = {
  categories: Array<Pick<Category, 'id' | 'slug' | 'title'>>
  excerpt: string
  featuredImage: Media | null
  id: number
  publishedAt: null | string
  slug: string
  title: string
}

export type PostDetail = PostPreview & {
  content: Post['content']
  seo: NonNullable<Post['seo']> | null
}

export type PublishedPostEntry = {
  slug: string
  updatedAt: string
}

const mapPostPreview = (post: Post): PostPreview => {
  return {
    categories: getPopulatedCategories(post.categories).map((category) => ({
      id: category.id,
      slug: category.slug,
      title: category.title,
    })),
    excerpt: post.excerpt,
    featuredImage: getPopulatedMedia(post.featuredImage),
    id: post.id,
    publishedAt: post.publishedAt ?? null,
    slug: post.slug,
    title: post.title,
  }
}

export const DEFAULT_POST_PAGE_SIZE = 10

const basePostWhere = {
  _status: {
    equals: 'published' as const,
  },
}

export const getPaginatedPosts = async (
  pageNumber: number,
  pageSize: number = DEFAULT_POST_PAGE_SIZE,
) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: pageSize,
    overrideAccess: false,
    page: pageNumber,
    sort: '-publishedAt',
    where: basePostWhere,
  })

  return {
    docs: result.docs.map(mapPostPreview),
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    page: result.page,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}

export const getRecentPosts = async (args?: { excludeSlugs?: string[]; limit?: number }) => {
  const payload = await getPayloadClient()

  const limit = args?.limit ?? 5
  const excludeSlugs = args?.excludeSlugs?.filter(Boolean) ?? []

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-publishedAt',
    where:
      excludeSlugs.length > 0
        ? {
            and: [basePostWhere, { slug: { not_in: excludeSlugs } }],
          }
        : basePostWhere,
  })

  return result.docs.map(mapPostPreview)
}

export const getPostBySlug = async (slug: string): Promise<PostDetail | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [basePostWhere, { slug: { equals: slug } }],
    },
  })

  const post = result.docs[0]

  if (!post) {
    return null
  }

  return {
    ...mapPostPreview(post),
    content: post.content,
    seo: post.seo ?? null,
  }
}

export const getPostsByCategorySlug = async (categorySlug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [basePostWhere, { 'categories.slug': { equals: categorySlug } }],
    },
  })

  return result.docs.map(mapPostPreview)
}

export const getPublishedPostEntries = async (): Promise<PublishedPostEntry[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    sort: '-publishedAt',
    where: basePostWhere,
  })

  return result.docs.map((post) => ({
    slug: post.slug,
    updatedAt: post.updatedAt,
  }))
}

export const getPostsByIDs = async (ids: number[]) => {
  if (ids.length === 0) {
    return []
  }

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: ids.length,
    overrideAccess: false,
    where: {
      and: [basePostWhere, { id: { in: ids } }],
    },
  })

  const previews = result.docs.map(mapPostPreview)
  const sortOrder = new Map(ids.map((id, index) => [id, index]))

  return previews.sort((a, b) => {
    return (sortOrder.get(a.id) ?? 0) - (sortOrder.get(b.id) ?? 0)
  })
}
