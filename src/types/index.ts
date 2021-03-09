import type { AllHTMLAttributes, ReactNode } from 'react';
import type { Tx, SignMeta } from '@tendermint/sig';

export type GlobalProps = {
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  children?: ReactNode;
} & AllHTMLAttributes<HTMLElement>;

export type IncomingTx = {
  tx: Tx;
  meta: SignMeta;
};
