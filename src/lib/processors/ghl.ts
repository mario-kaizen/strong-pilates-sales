import type { GhlResult } from './types'

const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function pullGhlContacts(locationId: string, pit: string): Promise<GhlResult> {
  const monthlyContacts: { [month: string]: number } = {}
  let totalContacts = 0
  let contactsWithEmail = 0

  let nextPageUrl: string | null =
    `${GHL_BASE}/contacts/?locationId=${locationId}&limit=100`

  while (nextPageUrl) {
    const response: Response = await fetch(nextPageUrl, {
      headers: {
        Authorization: `Bearer ${pit}`,
        Version: '2021-07-28',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status} ${response.statusText}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = await response.json()
    const contacts: Array<{
      email?: string | null
      dateAdded?: string | null
    }> = data.contacts ?? []

    if (contacts.length === 0) break

    for (const contact of contacts) {
      totalContacts++

      const hasEmail = typeof contact.email === 'string' && contact.email.trim() !== ''

      if (hasEmail) {
        contactsWithEmail++

        if (contact.dateAdded) {
          const month = contact.dateAdded.slice(0, 7) // YYYY-MM
          monthlyContacts[month] = (monthlyContacts[month] ?? 0) + 1
        }
      }
    }

    nextPageUrl = data.meta?.nextPageUrl ?? null

    if (nextPageUrl) {
      await new Promise(r => setTimeout(r, 50))
    }
  }

  return { totalContacts, contactsWithEmail, monthlyContacts }
}
