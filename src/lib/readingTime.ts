import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

const WORDS_PER_MINUTE = 220

export const getReadingTimeMinutes = (value: unknown): number => {
  if (!value || typeof value !== 'object') {
    return 1
  }

  const plainText = convertLexicalToPlaintext({
    data: value as Parameters<typeof convertLexicalToPlaintext>[0]['data'],
  })

  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  if (words === 0) {
    return 1
  }

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
