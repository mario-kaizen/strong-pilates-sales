export interface MonthlyData {
  [month: string]: {
    contacts?: number
    accounts?: number
    intros: number
    memberships: number
    packages: number
    cancellations: number
  }
}

export interface PlanBreakdown {
  [planName: string]: {
    count: number
    revenue: number
    price: number
  }
}

export interface TierData {
  premium: { count: number; revenue: number }
  mid: { count: number; revenue: number }
  low: { count: number; revenue: number }
}

export interface FunnelData {
  contacts: number
  contactsWithEmail: number
  accounts: number
  introBuyers: number
  converted: number
  active: number
  suspended: number
  cancelled: number
}

export interface HapanaResult {
  totalIntros: number
  totalMemberships: number
  totalCancellations: number
  totalPackages: number
  activeMemberships: number
  activeIntros: number
  suspendedCount: number
  uniqueIntroBuyers: number
  uniqueMemberHolders: number
  introConversionRate: number
  churnRate: number
  totalMrr: number
  avgMemberValue: number
  monthlyData: MonthlyData
  membershipBreakdown: PlanBreakdown
  introBreakdown: { [name: string]: number }
  suspendedBreakdown: { [name: string]: number }
  memberTiers: TierData
  cancellationReasons: { [reason: string]: number }
}

export interface MetaAdsMonthlyData {
  [month: string]: {
    spend: number
    leads: number
    realLeads: number
    impressions: number
    clicks: number
    purchases: number
    landingPageViews: number
    leadForms: number
    pixelLeads: number
    customEvents: number
    lpvResults: number
  }
}

export interface CampaignGroup {
  name: string
  spend: number
  leads: number
}

export interface MetaAdsResult {
  totalSpend: number
  presaleSpend: number
  operatingSpend: number
  operatingLeads: number
  operatingCpl: number
  costPerIntro: number
  monthlyData: MetaAdsMonthlyData
  campaignBreakdown: CampaignGroup[]
  realLeads: number
}

export interface GhlResult {
  totalContacts: number
  contactsWithEmail: number
  monthlyContacts: { [month: string]: number }
}

export interface DiagnosisResult {
  challenges: string[]
  blindspots: string[]
  recommendations: string[]
  summary: string
}
