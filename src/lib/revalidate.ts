import type { PayloadRequest } from 'payload'

type RevalidationRequest = {
  paths?: string[]
  req: PayloadRequest
  source: string
  tags?: string[]
}

const normalizePath = (path: string): string => {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

const dedupe = (values: string[]): string[] => {
  return [...new Set(values)]
}

export const requestRevalidation = async ({
  paths = [],
  req,
  source,
  tags = [],
}: RevalidationRequest): Promise<void> => {
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const secret = process.env.REVALIDATION_SECRET

  if (!siteURL || !secret) {
    req.payload.logger.warn(
      `Skipping revalidation request from ${source}: missing ${[
        !siteURL ? 'NEXT_PUBLIC_SITE_URL' : null,
        !secret ? 'REVALIDATION_SECRET' : null,
      ]
        .filter(Boolean)
        .join(', ')}`,
    )

    return
  }

  const normalizedPaths = dedupe(paths.map(normalizePath).filter(Boolean))
  const normalizedTags = dedupe(tags.filter(Boolean))

  if (normalizedPaths.length === 0 && normalizedTags.length === 0) {
    return
  }

  try {
    const response = await fetch(`${siteURL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({
        paths: normalizedPaths,
        source,
        tags: normalizedTags,
      }),
    })

    if (!response.ok) {
      req.payload.logger.warn(
        `Revalidation request failed from ${source} with status ${response.status}: ${response.statusText}`,
      )
    }
  } catch (error) {
    req.payload.logger.error(`Revalidation request error from ${source}: ${String(error)}`)
  }
}
