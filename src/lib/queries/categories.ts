import type { Category } from '@/payload-types'

import { getPayloadClient } from '@/lib/payload'

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

export const getAllCategories = async (): Promise<Category[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  return result.docs
}
