import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export const Container = ({ children, className }: Props) => {
  return <div className={['container', className].filter(Boolean).join(' ')}>{children}</div>
}
