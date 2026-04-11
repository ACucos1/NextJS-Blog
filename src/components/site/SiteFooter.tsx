import { Container } from '@/components/ui/Container'
import type { SiteSetting } from '@/payload-types'

type Props = {
  siteSettings: SiteSetting | null
}

export const SiteFooter = ({ siteSettings }: Props) => {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <p>{siteSettings?.footerText || `© ${new Date().getFullYear()} ${siteSettings?.siteName || ''}`}</p>

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
