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
};

export type LayoutDisplayTypes = keyof LayoutDisplayComponentProps;

export type GlobalDisplay = {
  '*': any;
  status: string;
  memo: string;
  fee: CoinAsObject;
  balance: CoinAsObject;
  estimatedValue: CoinAsObject;
};
