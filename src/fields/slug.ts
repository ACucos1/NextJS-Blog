import type { TextField, TextFieldSingleValidation } from 'payload'

type SlugFieldOptions = {
  fieldToUse?: string
  reservedSlugs?: string[]
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const formatSlug = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

const slugValidator = (reservedSlugs: string[] = []): TextFieldSingleValidation => {
  const reserved = reservedSlugs.map((slug) => slug.toLowerCase())

  return (value: null | string | undefined) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return 'Slug is required'
    }

    const normalized = formatSlug(value)

    if (!normalized) {
      return 'Slug is required'
    }

    if (!slugPattern.test(normalized)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (reserved.includes(normalized)) {
      return `The slug "${normalized}" is reserved`
    }

    return true
  }
}

export const slugField = ({
  fieldToUse = 'title',
  reservedSlugs = [],
}: SlugFieldOptions = {}): TextField => {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
    },
    validate: slugValidator(reservedSlugs),
    hooks: {
      beforeValidate: [
        ({ value, data, siblingData }) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            return formatSlug(value)
          }

          const source = (siblingData ?? data ?? {}) as Record<string, unknown>
          const fallbackValue = source[fieldToUse]

          if (typeof fallbackValue === 'string' && fallbackValue.trim().length > 0) {
            return formatSlug(fallbackValue)
          }

          return value
        },
      ],
    },
  }
}
