'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import InsightCard from '@/components/ui/InsightCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG, SCALE_DEFAULTS } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface MonthlyDataEntry {
  month: string
  contactsCreated: number
  accountsCreated: number
  introsPurchased: number
  membershipsPurchased: number
  packagesPurchased: number
  membershipsCancelled: number
}

interface MonthlyActivityProps {
  monthlyData: MonthlyDataEntry[]
  dataNote?: string
}

export default function MonthlyActivity({ monthlyData, dataNote }: MonthlyActivityProps) {
  const months = monthlyData.map(d => d.month)
  const contactsCreated = monthlyData.map(d => d.contactsCreated)
  const accountsCreated = monthlyData.map(d => d.accountsCreated)
  const introsPurchased = monthlyData.map(d => d.introsPurchased)
  const membershipsPurchased = monthlyData.map(d => d.membershipsPurchased)
  const packagesPurchased = monthlyData.map(d => d.packagesPurchased)
  const membershipsCancelled = monthlyData.map(d => d.membershipsCancelled)

  const peakContacts = Math.max(...contactsCreated)
  const latestContacts = contactsCreated[contactsCreated.length - 1] || 0
  const peakAccounts = Math.max(...accountsCreated)
  const latestAccounts = accountsCreated[accountsCreated.length - 1] || 0

  const pipelineConfig = useMemo<ChartConfiguration>(() => ({
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Contacts Created (Grow)', data: contactsCreated, borderColor: COLORS.blue, backgroundColor: COLORS.blueLight, fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: COLORS.blue, borderWidth: 2.5, order: 1 },
        { label: 'Accounts Created (Core)', data: accountsCreated, borderColor: COLORS.gold, backgroundColor: COLORS.goldLight, fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: COLORS.gold, borderWidth: 2.5, order: 2 },
        { label: 'Intro Offers Purchased', data: introsPurchased, borderColor: COLORS.orange, backgroundColor: COLORS.orangeLight, fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: COLORS.orange, borderWidth: 2.5, order: 3 },
        { label: 'Memberships Purchased', data: membershipsPurchased, borderColor: COLORS.green, backgroundColor: COLORS.greenLight, fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: COLORS.green, borderWidth: 2.5, order: 4 },
        { label: 'Packages Purchased', data: packagesPurchased, borderColor: COLORS.purple, backgroundColor: COLORS.purpleLight, fill: false, tension: 0.3, pointRadius: 3, pointBackgroundColor: COLORS.purple, borderWidth: 2, borderDash: [5, 3], order: 5 },
        { label: 'Memberships Cancelled', data: membershipsCancelled, borderColor: COLORS.red, backgroundColor: COLORS.redLight, fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: COLORS.red, borderWidth: 2.5, order: 6 },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'start', labels: { padding: 16 } }, tooltip: TOOLTIP_CONFIG },
      scales: SCALE_DEFAULTS,
    },
  }), [months, contactsCreated, accountsCreated, introsPurchased, membershipsPurchased, packagesPurchased, membershipsCancelled])

  const contactsVsAccountsConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Contacts Created (Grow)', data: contactsCreated, backgroundColor: COLORS.blue, borderRadius: 4, barPercentage: 0.85, categoryPercentage: 0.75 },
        { label: 'Accounts Created (Core)', data: accountsCreated, backgroundColor: COLORS.gold, borderRadius: 4, barPercentage: 0.85, categoryPercentage: 0.75 },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end' }, tooltip: TOOLTIP_CONFIG },
      scales: SCALE_DEFAULTS,
    },
  }), [months, contactsCreated, accountsCreated])

  const purchasesByCategoryConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Intro Offers', data: introsPurchased, backgroundColor: COLORS.orange, borderRadius: 4, barPercentage: 0.85, categoryPercentage: 0.75 },
        { label: 'Memberships', data: membershipsPurchased, backgroundColor: COLORS.green, borderRadius: 4, barPercentage: 0.85, categoryPercentage: 0.75 },
        { label: 'Packages', data: packagesPurchased, backgroundColor: COLORS.purple, borderRadius: 4, barPercentage: 0.85, categoryPercentage: 0.75 },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end' }, tooltip: TOOLTIP_CONFIG },
      scales: SCALE_DEFAULTS,
    },
  }), [months, introsPurchased, membershipsPurchased, packagesPurchased])

  return (
    <SectionWrapper
      id="section-03"
      label="03 — The Full Picture"
      title="Month-by-Month Activity"
      description="Every stage of the customer journey tracked month over month — from first contact to membership purchase. This is the complete pipeline view."
    >
      <ChartWrap
        title="Complete Pipeline — Month by Month"
        subtitle={`${months[0]} — ${months[months.length - 1]} (current month partial) \u00B7 Hapana Grow + Hapana Core`}
      >
        <ChartWrapper config={pipelineConfig} height={360} />
        {dataNote && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              background: 'rgba(200, 169, 81, 0.08)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: '0 8px 8px 0',
              fontSize: '12px',
              color: 'var(--ink-muted)',
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: 'var(--ink-light)' }}>Data context:</strong> {dataNote}
          </div>
        )}
      </ChartWrap>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ChartWrap title="Contacts Created vs. Accounts Created" subtitle="The gap between CRM contacts (Grow) and actual accounts (Core)">
          <ChartWrapper config={contactsVsAccountsConfig} height={240} />
        </ChartWrap>
        <ChartWrap title="Purchases by Category" subtitle="Intro Offers vs. Memberships vs. Packages (Hapana Core)">
          <ChartWrapper config={purchasesByCategoryConfig} height={240} />
        </ChartWrap>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={`${peakContacts} \u2192 ${latestContacts}`} title="Contact Volume Declining">
          <p>CRM contacts with email peaked at {peakContacts} and have dropped to {latestContacts} (partial current month). But <strong>volume isn&apos;t the problem</strong> — conversion is. 80% of contacts never even create an account.</p>
        </InsightCard>
        <InsightCard number={`${peakAccounts} \u2192 ${latestAccounts}`} title="Account Creation Falling">
          <p>New Hapana Core accounts peaked at {peakAccounts} and have dropped to {latestAccounts} this month. Fewer people are making it from contact to account — the top of the funnel is narrowing.</p>
        </InsightCard>
      </div>
    </SectionWrapper>
  )
}
