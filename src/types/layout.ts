import { SupportedDenoms } from './denoms';

export type CoinAsObject = {
  denom: SupportedDenoms | string;
  amount: number;
};

type SharedComponentProps = {
  label: string;
  dataKey: string;
};

export type LayoutDisplayComponentProps = {
  String: {
    data: string;
  } & SharedComponentProps;
  Coin: {
    data: CoinAsObject;
  } & SharedComponentProps;
  Coins: {
    data: CoinAsObject[];
  } & SharedComponentProps;
};

export type LayoutDisplayTypes = keyof LayoutDisplayComponentProps;

export type GlobalDisplay = {
  status: string;
  fee: CoinAsObject;
  balance: CoinAsObject;
};
