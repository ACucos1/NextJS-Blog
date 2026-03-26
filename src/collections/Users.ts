import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { firstUserOrAdmin } from '@/access/firstUserOrAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'name', 'roles', 'updatedAt'],
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: firstUserOrAdmin,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      saveToJWT: true,
      defaultValue: ['admin'],
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'media',
    },
  ],
}
