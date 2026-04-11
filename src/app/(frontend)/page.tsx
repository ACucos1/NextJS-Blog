import { PostList } from '@/components/posts/PostList'
import { RichText } from '@/components/rich-text/RichText'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getPostsByIDs, getRecentPosts } from '@/lib/queries/posts'
import { getHomepageSettings } from '@/lib/queries/site'
import type { Homepage } from '@/payload-types'

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

export default async function HomePage() {
  const homepage = await getHomepageSettings()

  const featuredIDs = getFeaturedPostIDs(homepage).slice(0, 3)
  const recentWorkLimit = homepage?.recentWorkLimit ?? 5

  let featuredPosts = featuredIDs.length > 0 ? await getPostsByIDs(featuredIDs) : []
  let recentPosts = []

  if (featuredPosts.length === 0) {
    const fallbackPosts = await getRecentPosts({
      limit: Math.max(recentWorkLimit + 3, 6),
    })

    featuredPosts = fallbackPosts.slice(0, 3)
    recentPosts = fallbackPosts.slice(3, 3 + recentWorkLimit)
  } else {
    recentPosts = await getRecentPosts({
      excludeSlugs: featuredPosts.map((post) => post.slug),
      limit: recentWorkLimit,
    })
  }

  return (
    <Container className="home-page">
      <section className="hero">
        <p className="hero__eyebrow">Personal blog</p>
        <h1>{homepage?.headline || 'Notes on building, design, and software.'}</h1>
        {homepage?.intro ? (
          <RichText className="hero__intro hero__intro-rich-text" content={homepage.intro} />
        ) : (
          <p className="hero__intro">Welcome to my corner of the web.</p>
        )}
      </section>

      <section className="home-section">
        <SectionHeading>{homepage?.featuredSectionHeading || 'Featured'}</SectionHeading>
        <PostList posts={featuredPosts} />
      </section>

      <section className="home-section">
        <SectionHeading>{homepage?.recentWorkHeading || 'Recent work'}</SectionHeading>
        <PostList posts={recentPosts} />
      </section>
    </Container>
  )
}
