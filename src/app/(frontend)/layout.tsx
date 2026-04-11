import { Inter, JetBrains_Mono } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getNavigationPages, getSiteSettings } from '@/lib/queries/site'

import './styles.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata = {
  description: 'Personal blog built with Payload CMS and Next.js',
  title: 'My Blog',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const [siteSettings, navigationPages] = await Promise.all([getSiteSettings(), getNavigationPages()])

  return (
    <html className={`${inter.variable} ${jetbrainsMono.variable}`} lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>

        <SiteHeader navigationPages={navigationPages} siteName={siteSettings?.siteName} />

        <main className="site-main" id="main-content">
          {children}
        </main>

        <SiteFooter siteSettings={siteSettings} />
      </body>
    </html>
  )
}
