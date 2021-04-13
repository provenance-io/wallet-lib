import type { AllHTMLAttributes, ReactNode } from 'react';

export type GlobalProps = {
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  children?: ReactNode;
} & AllHTMLAttributes<HTMLElement>;

export type SupportedDenoms = 'nhash';

export type CoinAsObject = {
  denom: SupportedDenoms | string;
  amount: number;
};
