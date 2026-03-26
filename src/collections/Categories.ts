import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { slugField } from '@/fields/slug'
import {
  revalidateCategoryAfterChange,
  revalidateCategoryAfterDelete,
} from '@/hooks/revalidateContent'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
    },
  ],
  hooks: {
    afterChange: [revalidateCategoryAfterChange],
    afterDelete: [revalidateCategoryAfterDelete],
  },
}
