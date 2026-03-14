import React from 'react'
import StatCard from '@/components/ui/StatCard'
import SectionWrapper from './SectionWrapper'

interface SnapshotProps {
  activeMemberships: number
  totalMrr: number
  activeIntros: number
  suspendedCount: number
  totalContacts: number
  uniqueMemberHolders: number
  totalPackages: number
  avgMemberValue: number
  churnRate: number
  totalCancellations: number
  totalMemberships: number
}

export default function Snapshot({
  activeMemberships,
  totalMrr,
  activeIntros,
  suspendedCount,
  totalContacts,
  uniqueMemberHolders,
  totalPackages,
  avgMemberValue,
  churnRate,
  totalCancellations,
  totalMemberships,
}: SnapshotProps) {
  const formattedMrr = totalMrr >= 1000
    ? `$${(totalMrr / 1000).toFixed(1)}K`
    : `$${totalMrr.toFixed(0)}`

  return (
    <SectionWrapper
      id="section-01"
      label="01 — Snapshot"
      title="Where You Stand Today"
      description="A high-level view of your current membership base, revenue, and the intro offer pipeline."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard label="Active Members" value={activeMemberships} sub="Recurring memberships" />
        <StatCard label="Monthly Revenue" value={formattedMrr} sub="Membership MRR only" />
        <StatCard label="Active Intro Offers" value={activeIntros} sub="Currently unconverted" variant="warning" />
        <StatCard label="Suspended" value={suspendedCount} sub="At risk of cancelling" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Unique Members (All Time)" value={uniqueMemberHolders} sub={`${totalMemberships} total membership records`} />
        <StatCard label="Memberships Cancelled" value={totalCancellations} sub="Zero cancellation reasons logged" variant="danger" />
        <StatCard label="Active Packages" value={totalPackages} sub="Class packs, casuals, etc." />
        <StatCard
          label="Cancellation Rate"
          value={`${churnRate.toFixed(1)}%`}
          sub={`${totalCancellations} of ${totalMemberships} memberships cancelled`}
          variant="danger"
        />
      </div>
    </SectionWrapper>
  )
}
