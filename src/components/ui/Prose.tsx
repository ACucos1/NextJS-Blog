import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export const Prose = ({ children, className }: Props) => {
  return <div className={['prose', className].filter(Boolean).join(' ')}>{children}</div>
}
