import { SupportedDenoms } from '../types';

export const DENOM_TO_DISPLAY_MAP: { [key in SupportedDenoms]?: string } = {
  hash: 'Hash',
  usd: 'USD',
};

export const getReadableDenom = (denom: SupportedDenoms | string) => {
  const readable = DENOM_TO_DISPLAY_MAP[denom as SupportedDenoms];
  return readable || denom;
};
