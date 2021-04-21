import type { AllHTMLAttributes, ReactNode } from 'react';

export { BroadcastMode, BroadcastTxRequest, SimulateRequest } from '../proto/cosmos/tx/v1beta1/service_pb';

export * from './smart-contract';

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
