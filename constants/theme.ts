// Palette of the welcome screen: navy + orange on white.
export const colors = {
  /** Headers, selected states, links and icons. */
  primary: '#0F1B4C',
  primaryDark: '#0A1338',
  /** Light navy tint behind icons and selected rows. */
  primarySoft: '#E9ECF5',
  primarySofter: '#F3F4F9',
  /**
   * Main action buttons (Réserver, Commander, Payer…). Darkest orange that keeps white text
   * readable (4.5:1). The brighter `orange` stays for decoration: highlights, progress, badges.
   */
  accent: '#C4501A',
  accentSoft: '#FFF1E6',
  navy: '#0F1B4C',
  text: '#121A3A',
  muted: '#8A93A8',
  muted2: '#6B7389',
  bg: '#ECEFF4',
  // Pure white: the cream tint looked yellowish on the cool grey background.
  card: '#FFFFFF',
  input: '#F3F5FA',
  border: '#E2E6EE',
  success: '#1FA35A',
  successBg: '#E7F8EE',
  warning: '#E3921A',
  warningBg: '#FFF4E3',
  danger: '#E25C6A',
  dangerBg: '#FDECEE',
  orange: '#F07A2A',
  purple: '#7B6CF6',
  green: '#2E9B57',
  tabInactive: '#9AA3B8',
  // Darker shades for small colored text on white (≥ 4.5:1 contrast).
  successText: '#157A43',
  warningText: '#9A5B00',
  orangeText: '#B8540F',
  dangerText: '#C23A4A',
  purpleText: '#5A4BD1',
};

/**
 * Corner scale: xs for small chips and thumbnails, sm for icon tiles and small buttons,
 * md for fields, buttons and inner panels, lg for cards, xl for sheets. Circles use size / 2.
 */
export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#1E2A5A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  /** Stronger, softer lift for cards that should stand out from the page. */
  raised: {
    shadowColor: '#1E2A5A',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
