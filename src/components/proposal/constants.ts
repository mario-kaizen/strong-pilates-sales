export const COLORS = {
  gold: '#C8A951',
  goldLight: 'rgba(200, 169, 81, 0.15)',
  goldDark: '#A88B3A',
  red: '#C44536',
  redLight: 'rgba(196, 69, 54, 0.15)',
  blue: '#4A6FA5',
  blueLight: 'rgba(74, 111, 165, 0.15)',
  green: '#4A7C59',
  greenLight: 'rgba(74, 124, 89, 0.15)',
  orange: '#D4853A',
  orangeLight: 'rgba(212, 133, 58, 0.15)',
  purple: '#7B5EA7',
  purpleLight: 'rgba(123, 94, 167, 0.15)',
  teal: '#2A9D8F',
  tealLight: 'rgba(42, 157, 143, 0.15)',
  ink: '#1A1A1A',
  inkMuted: '#6B6B6B',
  cream: '#FAF7F2',
  creamDark: '#F0EBE3',
  divider: 'rgba(26, 26, 26, 0.08)',
} as const

export const TOOLTIP_CONFIG = {
  backgroundColor: COLORS.ink,
  titleFont: { weight: 'bold' as const },
  padding: 12,
  cornerRadius: 8,
} as const

export const SCALE_DEFAULTS = {
  x: { grid: { display: false }, border: { display: false } },
  y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true },
} as const
