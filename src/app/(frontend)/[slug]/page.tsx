import { notFound } from 'next/navigation'

import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { getPageBySlug } from '@/lib/queries/pages'

type Props = {
  params: Promise<{
    slug: string
  }>
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
