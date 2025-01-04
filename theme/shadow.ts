import { Config, ResolvableTo } from 'tailwindcss/types/config';

export const boxShadow: ResolvableTo<Config['theme']> = ({ theme }) => ({
  DEFAULT: `20px 0px 20px 0px ${theme('colors.shadow')}`,
  none: 'none',
  // 0 10px 100px
  base: `0px 0.625rem 9.375rem 0px ${theme('colors.shadow')}`,
  // 0 6px 40px
  card: `0px 0.375rem 2.5rem 0px ${theme('colors.shadow')}`,
});
