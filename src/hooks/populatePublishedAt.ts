import type { CollectionBeforeChangeHook } from 'payload'

type DraftData = {
  _status?: 'draft' | 'published'
  publishedAt?: null | string
}

export const populatePublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const incomingData = (data ?? {}) as DraftData
  const existingData = (originalDoc ?? {}) as DraftData

  const nextStatus = incomingData._status ?? existingData._status

  if (nextStatus !== 'published') {
    return data
  }

  if (incomingData.publishedAt || existingData.publishedAt) {
    return data
  }

  return {
    ...incomingData,
    publishedAt: new Date().toISOString(),
  }
}
