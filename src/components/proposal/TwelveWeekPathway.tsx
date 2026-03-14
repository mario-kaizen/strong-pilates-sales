import React from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'

interface Phase {
  number: number
  label: string
  weeks: string
  color: string
  colorLight: string
  title: string
  subtitle: string
  whatWeDo: string[]
  whatYoullSee: string[]
  whatWeNeed: string[]
  kelownaStat?: string
  strongAdvantage?: string
}

interface TwelveWeekPathwayProps {
  unconvertedIntros?: number
  suspendedCount?: number
  cancelledCount?: number
  introTypeCount?: number
}

export default function TwelveWeekPathway({
  unconvertedIntros = 282,
  suspendedCount = 59,
  cancelledCount = 230,
  introTypeCount = 14,
}: TwelveWeekPathwayProps) {
  const phases: Phase[] = [
    {
      number: 1,
      label: 'Phase 1',
      weeks: 'Weeks 1\u20132',
      color: 'var(--gold)',
      colorLight: 'rgba(200, 169, 81, 0.15)',
      title: 'Onramp Fast Track \u2014 Foundation & First Campaign Live',
      subtitle: 'Build the marketing ecosystem from scratch. First campaign goes live by end of this phase.',
      whatWeDo: [
        'Full audit of Hapana Grow + Core',
        `Offer clarity \u2014 simplify from ${introTypeCount} intro types to 1-2`,
        'CRM pipeline rebuild \u2014 track every stage',
        'Ad creative design + copywriting',
        'Nurture sequences built and loaded',
        'Weekly metrics dashboard set up',
        'First campaign LIVE',
      ],
      whatYoullSee: [
        'Clean, working pipeline in Hapana Grow',
        'First leads coming in from new campaigns',
        'Automated nurture sequences firing',
        'Clear weekly metrics dashboard',
        'Every lead tracked from ad to account',
      ],
      whatWeNeed: [
        'Raw studio photos (interior, classes, instructors, lifestyle)',
        'Raw video footage (classes in action, behind the scenes)',
        '30-min onboarding call (your goals, your voice, your vibe)',
        'Confirmation on intro offer pricing',
      ],
      strongAdvantage: 'HQ sets the offer + we already have Core & Grow access = 7 days instead of 14.',
    },
    {
      number: 2,
      label: 'Phase 2',
      weeks: 'Weeks 3\u20136',
      color: 'var(--orange)',
      colorLight: 'rgba(212, 133, 58, 0.08)',
      title: 'Attract & Convert \u2014 Building the Pipeline',
      subtitle: 'Lower spend, higher quality leads, and a nurture system that actually works.',
      whatWeDo: [
        'Optimise ad campaigns based on live data',
        'Reduce spend \u2014 focus on CPA, not CPL',
        'Intro offer nurture sequences refined',
        'Team trained on instant connection systems',
        'Magic moments framework for intro sessions',
        'Weekly strategy calls + execution support',
      ],
      whatYoullSee: [
        'Intro offer purchases climbing week over week',
        'Better lead quality (less noise, more intent)',
        'Team engaging with intros proactively',
        'First membership conversions from new pipeline',
      ],
      whatWeNeed: [
        'Attend weekly strategy calls (30 min)',
        'Brief your team on the new intro offer flow',
        'Share feedback on lead quality weekly',
        'Any new photos/video as they come',
      ],
      kelownaStat: 'Intros went from 1/week to 41/week. Revenue climbing from $13K to $15K/week.',
    },
    {
      number: 3,
      label: 'Phase 3',
      weeks: 'Weeks 7\u201310',
      color: 'var(--blue)',
      colorLight: 'rgba(74, 111, 165, 0.08)',
      title: 'Deliver & Retain \u2014 Converting Intros to Members',
      subtitle: 'The intro-to-member bridge \u2014 where the real revenue lives.',
      whatWeDo: [
        'Intro-to-member conversion systems optimised',
        'Follow-up cadence for every intro buyer',
        'Humanised touchpoints at Day 1, 3, 7, 14',
        `Re-engagement campaigns for ${unconvertedIntros} unconverted intros`,
        `Reactivation outreach to ${suspendedCount} suspended members`,
        'Cancellation reason tracking system',
        `Win-back campaigns for ${cancelledCount} cancelled members`,
        'STRONG 4 phase-down strategy',
      ],
      whatYoullSee: [
        'Intro-to-member conversion climbing toward 50%',
        'Membership count growing week over week',
        'Suspended members reactivating',
        'Churn rate dropping \u2014 cancellation reasons visible',
        'Revenue growth accelerating',
      ],
      whatWeNeed: [
        'Attend weekly strategy calls (30 min)',
        'Implement team training recommendations',
        'Ensure instructors follow the magic moments playbook',
        'Report on intro offer attendance and feedback',
      ],
      kelownaStat: 'New members hit 16-17/week. Revenue crossed $20K/week. Members grew from 235 to 274.',
    },
    {
      number: 4,
      label: 'Phase 4',
      weeks: 'Weeks 11\u201312',
      color: 'var(--green)',
      colorLight: 'rgba(74, 124, 89, 0.08)',
      title: 'Scale & Systematise \u2014 Sustainable Growth',
      subtitle: 'Lock in the systems so growth continues without constant effort.',
      whatWeDo: [
        'Quarterly planning + growth sprint',
        'Ad creative refresh with new performance data',
        'Advanced segmentation and personalisation',
        'Team SOPs documented for ongoing execution',
        'Monthly reporting cadence locked in',
      ],
      whatYoullSee: [
        'Intro-to-member conversion at 40-50%+ (from 30%)',
        'CPA cut by 50%+ with same or fewer leads',
        'MRR trending toward $50K+/month',
        'A system that runs \u2014 not a hustle that exhausts',
      ],
      whatWeNeed: [
        'Attend monthly planning session (60 min)',
        'Fresh creative assets quarterly',
        'Continue team execution of SOPs',
        "That's it \u2014 the system runs itself",
      ],
      kelownaStat: 'Revenue hit $23.7K/week. Members at 276. Spending just $37/day on ads.',
    },
  ]

  return (
    <SectionWrapper
      id="section-11"
      label="11 — The Pathway"
      title="Your 12-Week Runway to Momentum"
      description="This isn't an overnight fix. It's a progressive, structured pathway that builds momentum week by week. Here's exactly what happens and when — no guesswork, no surprises."
    >
      {/* Hero callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2a2a1a 0%, var(--ink) 100%)',
          color: 'var(--cream)',
          borderRadius: '20px',
          padding: '40px 48px',
          margin: '0 0 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,169,81,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', fontWeight: 600, marginBottom: '16px', position: 'relative' }}>
              First campaign goes live by end of Week 2.
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
              Because we already have access to Hapana Core and Grow, and STRONG HQ sets the offer structure, we can move fast. All we need from you is raw studio media (photos and video) and we handle the rest.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>14</div>
            <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Days to Live</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '40px', marginBottom: '40px' }}>
        {/* Timeline line */}
        <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--gold), var(--green))' }} />

        {phases.map((phase, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: i < phases.length - 1 ? '40px' : 0 }}>
            {/* Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-33px',
                top: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: phase.color,
                border: '3px solid var(--cream)',
              }}
            />

            <ChartWrap title={phase.title} subtitle={phase.subtitle} style={{ marginBottom: 0 }}>
              {/* Phase badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', marginTop: '-20px' }}>
                <span
                  style={{
                    background: phase.colorLight,
                    color: phase.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: '100px',
                  }}
                >
                  {phase.label}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{phase.weeks}</span>
              </div>

              {/* 3-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px', lineHeight: 1.8 }}>
                <div>
                  <strong style={{ color: 'var(--ink-light)' }}>What We Do:</strong>
                  <ul style={{ color: 'var(--ink-muted)', margin: '4px 0 0 16px' }}>
                    {phase.whatWeDo.map((item, j) => (
                      <li key={j}>
                        {item === 'First campaign LIVE' ? (
                          <strong style={{ color: 'var(--gold-dark)' }}>{item}</strong>
                        ) : item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ color: 'var(--ink-light)' }}>
                    {phase.number === 4 ? "Where You Should Be:" : "What You'll See:"}
                  </strong>
                  <ul style={{ color: 'var(--ink-muted)', margin: '4px 0 0 16px' }}>
                    {phase.whatYoullSee.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                  {phase.kelownaStat && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(74, 124, 89, 0.08)', borderRadius: '8px', fontSize: '12px' }}>
                      <strong style={{ color: 'var(--green)' }}>Kelowna at this stage:</strong> {phase.kelownaStat}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--cream-dark)',
                      borderRadius: '10px',
                      border: '1px solid rgba(26, 26, 26, 0.08)',
                    }}
                  >
                    <strong style={{ color: 'var(--ink-light)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      What We Need from You:
                    </strong>
                    <ul
                      style={{
                        listStyle: 'none',
                        margin: '8px 0 0 0',
                        padding: 0,
                      }}
                    >
                      {phase.whatWeNeed.map((item, j) => (
                        <li
                          key={j}
                          style={{
                            position: 'relative',
                            paddingLeft: '24px',
                            marginBottom: '6px',
                            color: 'var(--ink-muted)',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: 0,
                              color: 'var(--gold)',
                              fontSize: '14px',
                            }}
                          >
                            &#9744;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {phase.strongAdvantage && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(200, 169, 81, 0.15)', borderRadius: '8px', fontSize: '12px' }}>
                      <strong style={{ color: 'var(--gold-dark)' }}>STRONG Advantage:</strong> {phase.strongAdvantage}
                    </div>
                  )}
                </div>
              </div>
            </ChartWrap>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
