import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const SectionHeading = ({ children }: Props) => {
  return (
    <h2 className="section-heading">
      <span aria-hidden="true" className="section-heading__motif">
        <span className="section-heading__blade" />
      </span>
      <span>{children}</span>
    </h2>
  )
}
