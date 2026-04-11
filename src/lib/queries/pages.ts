import type { Page } from '@/payload-types'

export type PublishedPageEntry = {
  slug: string
  updatedAt: string
}

import { getPayloadClient } from '@/lib/payload'

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
}

export const getPublishedPageEntries = async (): Promise<PublishedPageEntry[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    sort: 'slug',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs.map((page) => ({
    slug: page.slug,
    updatedAt: page.updatedAt,
  }))
}
