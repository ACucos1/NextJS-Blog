import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { revalidateHomepageAfterChange } from '@/hooks/revalidateContent'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'intro',
      type: 'richText',
    },
    {
      name: 'portrait',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'featuredSectionHeading',
      type: 'text',
      defaultValue: 'Featured',
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      validate: (value) => {
        if (Array.isArray(value) && value.length > 3) {
          return 'You can feature up to 3 posts.'
        }

        return true
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHomepageAfterChange],
  },
}
