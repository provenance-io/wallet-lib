import { CoinAsObject, SupportedDenoms } from '../types';

type DenomKeyObj = {
  [key in SupportedDenoms | string]: number;
};

type CoinDecimal = { denom: SupportedDenoms; decimal: number; decimalPlaces: number };

const COIN_DECIMAL_MAP: { [key in SupportedDenoms]?: CoinDecimal } = {
  nhash: {
    denom: 'hash',
    decimal: 1e9,
    decimalPlaces: 9,
  },
};

export const coinDecimalConvert = (coin: CoinAsObject): { denom: CoinAsObject['denom']; amount: string | number } => {
  const { denom, amount } = coin;
  const map = COIN_DECIMAL_MAP[denom as keyof typeof COIN_DECIMAL_MAP];
  if (map) {
    return {
      denom: map.denom,
      amount: (amount / map.decimal).toFixed(map.decimalPlaces),
    };
  }
  return coin;
};

export const coinListToDenomKeyObj = (list: CoinAsObject[]) =>
  list.reduce((keyObj, coin) => {
    if (keyObj[coin.denom]) {
      // eslint-disable-next-line
      keyObj[coin.denom] += coin.amount;
      return keyObj;
    }
    return { ...keyObj, [coin.denom]: coin.amount };
  }, {} as DenomKeyObj);
