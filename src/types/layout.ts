export type CoinAsObject = { denom: string; amount: string | number };

type SharedComponentProps = {
  label: string;
  dataKey: string;
};

export type LayoutDisplayComponentProps = {
  String: {
    data: string;
  } & SharedComponentProps;
  Json: {
    data: any;
  } & SharedComponentProps;
  Coin: {
    data: CoinAsObject;
  } & SharedComponentProps;
  Coins: {
    data: CoinAsObject[];
  } & SharedComponentProps;
  Disclaimer: {
    data: string;
  } & SharedComponentProps;
  TransactionFee: {
    data: CoinAsObject & {
      rate: number;
    };
  } & SharedComponentProps;
};

export type LayoutDisplayTypes = keyof LayoutDisplayComponentProps;

export type GlobalDisplay = {
  '*': any;
  status: string;
  memo: string;
  disclaimer?: string;
  fee: CoinAsObject;
  balance: CoinAsObject;
  estimatedValue: CoinAsObject;
};
