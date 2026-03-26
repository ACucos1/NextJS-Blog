import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { publishedOrAdmin } from '@/access/publishedOrAdmin'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { revalidatePostAfterChange, revalidatePostAfterDelete } from '@/hooks/revalidateContent'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publishedOrAdmin,
    update: adminOnly,
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
    },
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    seoField('media'),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidatePostAfterChange],
    afterDelete: [revalidatePostAfterDelete],
  },
  versions: {
    drafts: true,
  },
}
