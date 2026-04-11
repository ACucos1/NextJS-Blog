import { revalidatePath, revalidateTag } from 'next/cache'

type RevalidateBody = {
  paths?: string[]
  source?: string
  tags?: string[]
}

const normalizePath = (path: string): string => {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

const uniqueStrings = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return []
  }

  return [
    ...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)),
  ]
}

const isAuthorized = (request: Request): boolean => {
  const configuredSecret = process.env.REVALIDATION_SECRET

  if (!configuredSecret) {
    return false
  }

  const requestSecret = request.headers.get('x-revalidate-secret')

  return requestSecret === configuredSecret
}

export const runtime = 'nodejs'

export const POST = async (request: Request) => {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: RevalidateBody = {}

  try {
    body = (await request.json()) as RevalidateBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const paths = uniqueStrings(body.paths).map(normalizePath)
  const tags = uniqueStrings(body.tags)

  paths.forEach((path) => {
    revalidatePath(path)
  })

  tags.forEach((tag) => {
    revalidateTag(tag, 'max')
  })

  return Response.json({
    paths,
    revalidated: true,
    source: body.source || 'unknown',
    tags,
  })
}
