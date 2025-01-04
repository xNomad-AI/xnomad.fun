const defined = {
  max: 2560,
  'landscape-tablet': 1024,
  'portrait-tablet': 768,
  mobile: 576,
};

export const screens = {
  max: defined.max + 'px',
  'landscape-tablet': {
    max: defined['landscape-tablet'] + 'px',
  },
  'portrait-tablet': {
    max: defined['portrait-tablet'] + 'px',
  },
  mobile: {
    max: defined.mobile + 'px',
  },
};

export type ScreenBreakpoint = 'base' | 'max' | 'landscape-tablet' | 'portrait-tablet' | 'mobile' | 'not-mobile';

export function getScreen(viewport: unknown): ScreenBreakpoint {
  if (typeof viewport === 'number') {
    if (viewport >= defined.max) {
      return 'max';
    }

    if (viewport >= 1024) {
      return 'base';
    }

    if (viewport >= 768) {
      return 'landscape-tablet';
    }

    if (viewport >= 576) {
      return 'portrait-tablet';
    }

    return 'mobile';
  }

  return 'base';
}
