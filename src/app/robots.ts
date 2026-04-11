import type { MetadataRoute } from 'next'

import { getSiteURL } from '@/lib/metadata'

export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteURL}/sitemap.xml`,
    host: siteURL,
  }
}
