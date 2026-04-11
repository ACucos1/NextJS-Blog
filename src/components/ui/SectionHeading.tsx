import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const SectionHeading = ({ children }: Props) => {
  return <h2 className="section-heading">{children}</h2>
}
