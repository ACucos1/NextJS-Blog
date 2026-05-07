import { Container } from '@/components/ui/Container'
import type { SiteSetting } from '@/payload-types'

type Props = {
  siteSettings: SiteSetting | null
}

export const SiteFooter = ({ siteSettings }: Props) => {
  const siteName = siteSettings?.siteName || 'acucoscan'

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div className="site-footer__identity">
          <p>{siteSettings?.footerText || `© ${new Date().getFullYear()} ${siteName}`}</p>
          {!siteSettings?.footerText ? <p>Software, writing, and épée.</p> : null}
        </div>

        <ul className="footer-links">
          <li>
            <a href="/rss.xml">RSS</a>
          </li>
          {siteSettings?.socialLinks?.map((social) => (
            <li key={social.id || social.url}>
              <a href={social.url} rel="noreferrer" target="_blank">
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  )
}
