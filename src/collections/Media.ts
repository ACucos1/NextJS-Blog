import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
  upload: {
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
      },
      {
        name: 'card',
        width: 800,
      },
      {
        name: 'hero',
        width: 1600,
      },
      {
        name: 'og',
        height: 630,
        width: 1200,
      },
    ],
  },
}
