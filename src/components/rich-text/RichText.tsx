import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { Prose } from '@/components/ui/Prose'

type Props = {
  className?: string
  content: unknown
}

export const RichText = ({ className, content }: Props) => {
  if (!content || typeof content !== 'object') {
    return null
  }

  return (
    <Prose className={className}>
      <LexicalRichText data={content as Parameters<typeof LexicalRichText>[0]['data']} />
    </Prose>
  )
}
