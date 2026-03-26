import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { publishedOrAdmin } from '@/access/publishedOrAdmin'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidatePageAfterChange, revalidatePageAfterDelete } from '@/hooks/revalidateContent'

const reservedPageSlugs = ['blog', 'category', 'admin', 'api', 'rss.xml', 'sitemap.xml', 'robots.txt']

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publishedOrAdmin,
    update: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      reservedSlugs: reservedPageSlugs,
    }),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'navigationLabel',
      type: 'text',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showInNavigation),
      },
    },
    {
      name: 'navigationOrder',
      type: 'number',
      defaultValue: 100,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showInNavigation),
      },
    },
    seoField('media'),
  ],
  hooks: {
    afterChange: [revalidatePageAfterChange],
    afterDelete: [revalidatePageAfterDelete],
  },
  versions: {
    drafts: true,
  },
}
