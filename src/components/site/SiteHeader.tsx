import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import type { Page } from '@/payload-types'

import { ThemeToggle } from './ThemeToggle'

type Props = {
  navigationPages: Page[]
  siteName?: null | string
}

const getPageLabel = (page: Page) => {
  if (typeof page.navigationLabel === 'string' && page.navigationLabel.trim().length > 0) {
    return page.navigationLabel
  }

  return page.title
}

export const SiteHeader = ({ navigationPages, siteName }: Props) => {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link className="site-brand" href="/">
          {siteName || 'My Blog'}
        </Link>

        <div className="site-header__actions">
          <nav aria-label="Main navigation">
            <ul className="site-nav">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              {navigationPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`}>{getPageLabel(page)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
