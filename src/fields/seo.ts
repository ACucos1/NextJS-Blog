import type { CollectionSlug, GroupField } from 'payload'

export const seoField = (relationTo: CollectionSlug = 'media'): GroupField => {
  return {
    name: 'seo',
    type: 'group',
    admin: {
      description: 'Optional SEO overrides for this document.',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'image',
        type: 'relationship',
        relationTo,
      },
      {
        name: 'canonicalURL',
        type: 'text',
      },
    ],
  }
}
