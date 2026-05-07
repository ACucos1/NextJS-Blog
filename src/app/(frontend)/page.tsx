import { PostList } from '@/components/posts/PostList'
import type { Metadata } from 'next'

import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { buildMetadata } from '@/lib/metadata'
import { getPostsByIDs, getRecentPosts } from '@/lib/queries/posts'
import { getHomepageSettings, getSiteSettings } from '@/lib/queries/site'
import type { Homepage, Media } from '@/payload-types'

const getHomepagePortrait = (homepage: Homepage | null): Media | null => {
  const portrait = homepage?.portrait

  if (!portrait || typeof portrait !== 'object' || !('url' in portrait)) {
    return null
  }

  return portrait as Media
}

const getFeaturedPostIDs = (homepage: Homepage | null): number[] => {
  const featuredPosts = homepage?.featuredPosts

  if (!Array.isArray(featuredPosts)) {
    return []
  }

  return featuredPosts
    .map((featuredPost) => {
      if (typeof featuredPost === 'number') {
        return featuredPost
      }

      if (featuredPost && typeof featuredPost === 'object' && typeof featuredPost.id === 'number') {
        return featuredPost.id
      }

      return null
    })
    .filter((value): value is number => typeof value === 'number')
}

export async function generateMetadata(): Promise<Metadata> {
  const [homepage, siteSettings] = await Promise.all([getHomepageSettings(), getSiteSettings()])

  return buildMetadata({
    canonicalPath: '/',
    description: siteSettings?.defaultMetaDescription,
    siteSettings,
    title: homepage?.headline || siteSettings?.defaultMetaTitle || siteSettings?.siteName,
    type: 'website',
  })
}

export default async function HomePage() {
  const homepage = await getHomepageSettings()

  const portrait = getHomepagePortrait(homepage)
  const featuredIDs = getFeaturedPostIDs(homepage).slice(0, 3)

  let featuredPosts = featuredIDs.length > 0 ? await getPostsByIDs(featuredIDs) : []

  if (featuredPosts.length === 0) {
    featuredPosts = await getRecentPosts({ limit: 3 })
  }

  return (
    <Container className="home-page">
      <section className="hero">
        {portrait?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={portrait.alt}
            className="hero__portrait"
            src={portrait.sizes?.card?.url || portrait.url}
          />
        ) : null}

        <div className="hero__content">
          <p className="hero__eyebrow">Personal blog</p>
          <h1>{homepage?.headline || 'Notes on building, design, and software.'}</h1>
          {homepage?.intro ? (
            <RichText className="hero__intro hero__intro-rich-text" content={homepage.intro} />
          ) : (
            <p className="hero__intro">Welcome to my corner of the web.</p>
          )}
        </div>
      </section>

      <section className="home-section">
        <SectionHeading>{homepage?.featuredSectionHeading || 'Featured'}</SectionHeading>
        <PostList posts={featuredPosts} />
      </section>

    </Container>
  )
}
