import type { Access } from 'payload'

import { isAdmin } from './isAdmin'

export const firstUserOrAdmin: Access = async ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  try {
    const users = await req.payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })

    return users.totalDocs === 0
  } catch (error) {
    req.payload.logger.error(`Unable to check first-user bootstrap access: ${String(error)}`)

    return false
  }
}
