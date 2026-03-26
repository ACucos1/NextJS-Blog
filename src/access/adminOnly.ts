import type { Access } from 'payload'

import { isAdmin } from './isAdmin'

export const adminOnly: Access = ({ req: { user } }) => {
  return isAdmin(user)
}
