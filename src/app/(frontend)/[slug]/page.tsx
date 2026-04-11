import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/metadata'
import { getPageBySlug } from '@/lib/queries/pages'
import { getSiteSettings } from '@/lib/queries/site'
import { buildPagePath } from '@/lib/routes'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params

  const [page, siteSettings] = await Promise.all([getPageBySlug(slug), getSiteSettings()])

  if (!page) {
    return buildMetadata({
      canonicalPath: buildPagePath(slug),
      noIndex: true,
      siteSettings,
      title: 'Page not found',
    })
  }

  return buildMetadata({
    canonicalPath: buildPagePath(page.slug),
    canonicalURL: page.seo?.canonicalURL,
    description: page.seo?.description || page.description,
    image: page.seo?.image || page.heroImage,
    siteSettings,
    title: page.seo?.title || page.title,
  })
}

export default async function StaticPage(props: Props) {
  const { slug } = await props.params

  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <Container className="static-page">
      <header className="page-header">
        <h1>{page.title}</h1>
        {page.description ? <p>{page.description}</p> : null}
      </header>

      <RichText content={page.content} />
    </Container>
  )
}
