import type { Metadata } from 'next'

import type { Media, SiteSetting } from '@/payload-types'

const FALLBACK_SITE_NAME = 'My Blog'
const FALLBACK_DESCRIPTION = 'Personal blog powered by Payload CMS and Next.js.'

export const getSiteURL = (): string => {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!value) {
    return 'http://localhost:3000'
  }

  return value.replace(/\/$/, '')
}

export const toAbsoluteURL = (pathOrURL: string): string => {
  if (pathOrURL.startsWith('http://') || pathOrURL.startsWith('https://')) {
    return pathOrURL
  }

  const path = pathOrURL.startsWith('/') ? pathOrURL : `/${pathOrURL}`

  return `${getSiteURL()}${path}`
}

const getMediaURL = (image?: (Media | null) | number): null | string => {
  if (!image || typeof image === 'number') {
    return null
  }

  const ogURL = image.sizes?.og?.url

  if (ogURL) {
    return toAbsoluteURL(ogURL)
  }

  if (image.url) {
    return toAbsoluteURL(image.url)
  }

  return null
}

type BuildMetadataArgs = {
  canonicalPath?: string
  canonicalURL?: null | string
  description?: null | string
  image?: (Media | null) | number
  noIndex?: boolean
  siteSettings?: null | SiteSetting
  title?: null | string
  type?: 'article' | 'website'
}

export const buildMetadata = ({
  canonicalPath,
  canonicalURL,
  description,
  image,
  noIndex = false,
  siteSettings,
  title,
  type = 'website',
}: BuildMetadataArgs): Metadata => {
  const siteName = siteSettings?.siteName || FALLBACK_SITE_NAME
  const defaultTitle = siteSettings?.defaultMetaTitle || siteName
  const normalizedTitle = title?.trim()
  const resolvedTitle = normalizedTitle
    ? normalizedTitle.includes(siteName)
      ? normalizedTitle
      : `${normalizedTitle} | ${siteName}`
    : defaultTitle
  const resolvedDescription =
    description?.trim() || siteSettings?.defaultMetaDescription || FALLBACK_DESCRIPTION

  const canonical =
    canonicalURL?.trim() || (canonicalPath ? toAbsoluteURL(canonicalPath) : undefined)

  const resolvedImage = getMediaURL(image || siteSettings?.defaultOGImage)

  return {
    metadataBase: new URL(getSiteURL()),
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName,
      url: canonical,
      images: resolvedImage
        ? [
            {
              url: resolvedImage,
            },
          ]
        : undefined,
    },
    twitter: {
      card: resolvedImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  }
}
