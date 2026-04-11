import type { Page } from '@/payload-types'

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
