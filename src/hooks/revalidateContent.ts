import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { requestRevalidation } from '@/lib/revalidate'

const getSlug = (value: unknown): null | string => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const slug = (value as { slug?: unknown }).slug

  if (typeof slug !== 'string' || slug.trim().length === 0) {
    return null
  }

  return slug
}

const getCategorySlugs = (value: unknown): string[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  const categories = (value as { categories?: unknown }).categories

  if (!Array.isArray(categories)) {
    return []
  }

  return categories
    .map((category) => {
      if (typeof category === 'string') {
        return null
      }

      return getSlug(category)
    })
    .filter((categorySlug): categorySlug is string => Boolean(categorySlug))
}

export const revalidatePostAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const slug = getSlug(doc)
  const previousSlug = getSlug(previousDoc)
  const categorySlugs = [...getCategorySlugs(doc), ...getCategorySlugs(previousDoc)]

  const paths = ['/', '/blog']

  if (slug) {
    paths.push(`/blog/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    paths.push(`/blog/${previousSlug}`)
  }

  categorySlugs.forEach((categorySlug) => {
    paths.push(`/category/${categorySlug}`)
  })

  await requestRevalidation({
    paths,
    req,
    source: 'posts.afterChange',
    tags: ['posts', `post:${slug ?? previousSlug ?? 'unknown'}`, 'categories', 'rss', 'sitemap'],
  })

  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const slug = getSlug(doc)
  const categorySlugs = getCategorySlugs(doc)

  const paths = ['/', '/blog']

  if (slug) {
    paths.push(`/blog/${slug}`)
  }

  categorySlugs.forEach((categorySlug) => {
    paths.push(`/category/${categorySlug}`)
  })

  await requestRevalidation({
    paths,
    req,
    source: 'posts.afterDelete',
    tags: ['posts', `post:${slug ?? 'unknown'}`, 'categories', 'rss', 'sitemap'],
  })

  return doc
}

export const revalidatePageAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const slug = getSlug(doc)
  const previousSlug = getSlug(previousDoc)

  const paths: string[] = []

  if (slug) {
    paths.push(`/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    paths.push(`/${previousSlug}`)
  }

  await requestRevalidation({
    paths,
    req,
    source: 'pages.afterChange',
    tags: ['pages', `page:${slug ?? previousSlug ?? 'unknown'}`, 'navigation', 'sitemap'],
  })

  return doc
}

export const revalidatePageAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const slug = getSlug(doc)

  await requestRevalidation({
    paths: slug ? [`/${slug}`] : [],
    req,
    source: 'pages.afterDelete',
    tags: ['pages', `page:${slug ?? 'unknown'}`, 'navigation', 'sitemap'],
  })

  return doc
}

export const revalidateCategoryAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const slug = getSlug(doc)
  const previousSlug = getSlug(previousDoc)

  const paths = ['/blog']

  if (slug) {
    paths.push(`/category/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    paths.push(`/category/${previousSlug}`)
  }

  await requestRevalidation({
    paths,
    req,
    source: 'categories.afterChange',
    tags: ['categories', `category:${slug ?? previousSlug ?? 'unknown'}`, 'sitemap'],
  })

  return doc
}

export const revalidateCategoryAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const slug = getSlug(doc)

  await requestRevalidation({
    paths: ['/blog', ...(slug ? [`/category/${slug}`] : [])],
    req,
    source: 'categories.afterDelete',
    tags: ['categories', `category:${slug ?? 'unknown'}`, 'sitemap'],
  })

  return doc
}

export const revalidateHomepageAfterChange: GlobalAfterChangeHook = async ({ doc, req }) => {
  await requestRevalidation({
    paths: ['/'],
    req,
    source: 'homepage.afterChange',
    tags: ['homepage'],
  })

  return doc
}

export const revalidateSiteSettingsAfterChange: GlobalAfterChangeHook = async ({ doc, req }) => {
  await requestRevalidation({
    paths: ['/', '/blog'],
    req,
    source: 'site-settings.afterChange',
    tags: ['site-settings', 'navigation', 'rss', 'sitemap'],
  })

  return doc
}
