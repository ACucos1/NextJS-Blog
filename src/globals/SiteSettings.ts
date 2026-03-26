import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { revalidateSiteSettingsAfterChange } from '@/hooks/revalidateContent'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
    },
    {
      name: 'siteTagline',
      type: 'text',
    },
    {
      name: 'defaultMetaTitle',
      type: 'text',
    },
    {
      name: 'defaultMetaDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'defaultOGImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
    },
    {
      name: 'authorBio',
      type: 'textarea',
    },
    {
      name: 'authorImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'footerText',
      type: 'textarea',
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettingsAfterChange],
  },
}
