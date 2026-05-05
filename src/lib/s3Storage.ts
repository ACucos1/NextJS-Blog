import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

const REQUIRED_S3_ENV_VARS = [
  'S3_BUCKET',
  'S3_REGION',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const

const hasValue = (value: string | undefined): value is string => Boolean(value?.trim())

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) return false

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

const encodePathSegment = (value: string): string => encodeURIComponent(value)

const buildPublicFileURL = ({
  baseURL,
  filename,
  prefix,
}: {
  baseURL: string
  filename: string
  prefix?: string
}): string => {
  const trimmedBaseURL = baseURL.replace(/\/$/, '')
  const key = [prefix, filename]
    .filter(Boolean)
    .flatMap((value) => value!.split('/').filter(Boolean))
    .map(encodePathSegment)
    .join('/')

  return `${trimmedBaseURL}/${key}`
}

export const getStoragePlugins = (): Plugin[] => {
  const missingKeys = REQUIRED_S3_ENV_VARS.filter((key) => !hasValue(process.env[key]))
  const hasAnyConfigured = REQUIRED_S3_ENV_VARS.some((key) => hasValue(process.env[key]))

  if (hasAnyConfigured && missingKeys.length > 0) {
    throw new Error(
      `Incomplete S3 storage configuration. Missing env vars: ${missingKeys.join(', ')}`,
    )
  }

  if (!hasAnyConfigured) {
    return []
  }

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, '')
  const publicBaseURL = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')

  return [
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      bucket: process.env.S3_BUCKET!,
      clientUploads: parseBoolean(process.env.S3_CLIENT_UPLOADS),
      collections: {
        media: publicBaseURL
          ? {
            generateFileURL: ({ filename, prefix }) =>
              buildPublicFileURL({
                baseURL: publicBaseURL,
                filename,
                prefix,
              }),
          }
          : true,
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        endpoint,
        forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE),
        region: process.env.S3_REGION!,
      },
    }),
  ]
}
