import Link from 'next/link'

import { Container } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <Container className="not-found-page">
      <h1>Not found</h1>
      <p>The page you requested does not exist.</p>
      <Link href="/">Go back home</Link>
    </Container>
  )
}
