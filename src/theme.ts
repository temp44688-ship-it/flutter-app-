import { useColorScheme } from 'react-native';

export type AppColors = {
  background: string; surface: string; text: string; mutedText: string; border: string;
  primary: string; primaryText: string; danger: string; success: string; warningBackground: string;
};

export const LIGHT_COLORS: AppColors = {
  background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', mutedText: '#334155', border: '#CBD5E1',
  primary: '#0F766E', primaryText: '#FFFFFF', danger: '#B91C1C', success: '#166534', warningBackground: '#FFFBEB',
};
export const DARK_COLORS: AppColors = {
  background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', mutedText: '#E2E8F0', border: '#64748B',
  primary: '#2DD4BF', primaryText: '#042F2E', danger: '#FCA5A5', success: '#86EFAC', warningBackground: '#422006',
};
export function useAppColors(): AppColors { return useColorScheme() === 'dark' ? DARK_COLORS : LIGHT_COLORS; }
