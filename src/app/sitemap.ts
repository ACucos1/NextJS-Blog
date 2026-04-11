import type { MetadataRoute } from 'next'

import { getAllCategories } from '@/lib/queries/categories'
import { getPublishedPageEntries } from '@/lib/queries/pages'
import { getPublishedPostEntries } from '@/lib/queries/posts'
import { buildCategoryPath, buildPagePath, buildPostPath } from '@/lib/routes'
import { getSiteURL } from '@/lib/metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([
    getPublishedPostEntries(),
    getPublishedPageEntries(),
    getAllCategories(),
  ])

  const siteURL = getSiteURL()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteURL}/`,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteURL}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteURL}${buildPostPath(post.slug)}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteURL}${buildPagePath(page.slug)}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteURL}${buildCategoryPath(category.slug)}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes, ...pageRoutes, ...categoryRoutes]
}
