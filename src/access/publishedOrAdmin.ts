import type { Access } from 'payload'

import { isAdmin } from './isAdmin'

export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (isAdmin(user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
