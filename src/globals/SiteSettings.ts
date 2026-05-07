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
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
            },
            {
              name: 'footerText',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
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
          ],
        },
        {
          label: 'Social',
          fields: [
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
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettingsAfterChange],
  },
}
