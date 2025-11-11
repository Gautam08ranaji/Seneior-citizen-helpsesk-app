export const Typography = {
  captionRegular: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '500',
  },
  overlineRegular: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
  },
  displayLargeRegular: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
  },
  bodyLargeRegular: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '500',
  },
  bodyDefaultRegular: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
  },
  bodySmallRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
  },
  headingH1Regular: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
  },
  headingH2Regular: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '500',
  },

  // Medium Fonts
  captionMedium: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  overlineMedium: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  displayLargeMedium: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  bodyLargeMedium: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  bodyDefaultMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  bodySmallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  headingH1Medium: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },
  headingH2Medium: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'SFProDisplay-Medium',
    fontWeight: '500',
  },

  // Bold Fonts
  captionBold: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  overlineBold: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  displayLargeBold: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  bodyLargeBold: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  bodyDefaultBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  bodySmallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  headingH1Bold: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
  headingH2Bold: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
  },
} as const;

export type TypographyKey = keyof typeof Typography;
