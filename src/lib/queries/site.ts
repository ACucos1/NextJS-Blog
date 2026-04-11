import type { Homepage, Page, SiteSetting } from '@/payload-types'

import { getPayloadClient } from '@/lib/payload'

export const getSiteSettings = async (): Promise<SiteSetting | null> => {
  const payload = await getPayloadClient()

  try {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      overrideAccess: false,
    })

    return siteSettings
  } catch {
    return null
  }
}

export const getHomepageSettings = async (): Promise<Homepage | null> => {
  const payload = await getPayloadClient()

  try {
    const homepage = await payload.findGlobal({
      slug: 'homepage',
      depth: 1,
      overrideAccess: false,
    })

    return homepage
  } catch {
    return null
  }
}

export const getNavigationPages = async (): Promise<Page[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: 'navigationOrder',
    where: {
      and: [{ showInNavigation: { equals: true } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs
}
