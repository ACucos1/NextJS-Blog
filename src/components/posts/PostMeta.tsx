import Link from 'next/link'

type PostCategory = {
  id: number
  slug: string
  title: string
}

type Props = {
  categories?: PostCategory[]
  publishedAt?: null | string
  readingTimeMinutes?: number
}

const formatDate = (value?: null | string) => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date)
}

export const PostMeta = ({ categories = [], publishedAt, readingTimeMinutes }: Props) => {
  const formattedDate = formatDate(publishedAt)

  return (
    <div className="post-meta">
      {formattedDate && <span>{formattedDate}</span>}
      {readingTimeMinutes ? <span>{readingTimeMinutes} min read</span> : null}
      {categories.map((category) => (
        <Link className="category-link" href={`/category/${category.slug}`} key={category.id}>
          {category.title}
        </Link>
      ))}
    </div>
  )
}
