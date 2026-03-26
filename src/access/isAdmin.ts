type UserWithRoles = {
  roles?: null | string[]
} | null

export const isAdmin = (user: UserWithRoles): boolean => {
  if (!user || !Array.isArray(user.roles)) {
    return false
  }

  return user.roles.includes('admin')
}
