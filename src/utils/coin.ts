import { CoinAsObject, SupportedDenoms } from '../types';

type DenomKeyObj = {
  [key in SupportedDenoms | string]: number;
};

type CoinDecimal = { denom: SupportedDenoms; decimal: number; decimalPlaces: number };

export const COIN_DECIMAL_MAP: { [key in SupportedDenoms]?: CoinDecimal } = {
  nhash: {
    denom: 'hash',
    decimal: 1e9,
    decimalPlaces: 9,
  },
  exchangesc: {
    denom: 'usd',
    decimal: 1e2,
    decimalPlaces: 3,
  },
  cfigureomni: {
    denom: 'usd',
    decimal: 1e2,
    decimalPlaces: 3,
  },
  cfigure: {
    denom: 'usd',
    decimal: 1e2,
    decimalPlaces: 3,
  },
};

export const coinDecimalConvert = (coin: CoinAsObject | string): CoinAsObject => {
  const { denom, amount } = typeof coin === 'string' ? JSON.parse(coin) : coin;
  const map = COIN_DECIMAL_MAP[denom as keyof typeof COIN_DECIMAL_MAP];
  if (map) {
    return {
      denom: map.denom,
      amount: (Number(amount) / map.decimal).toFixed(map.decimalPlaces),
    };
  }
  return typeof coin === 'string' ? JSON.parse(coin) : coin;
};

export const decimalCoinConvert = (coin: CoinAsObject): CoinAsObject => {
  const { denom, amount } = coin;
  const map = COIN_DECIMAL_MAP[denom as keyof typeof COIN_DECIMAL_MAP];
  if (map) {
    return {
      denom: map.denom,
      amount: `${Number(amount) * map.decimal}`,
    };
  }
  return coin;
};

export const coinListToDenomKeyObj = (list: CoinAsObject[]) =>
  list.reduce((keyObj, coin) => {
    if (keyObj[coin.denom]) {
      // eslint-disable-next-line
      keyObj[coin.denom] = Number(coin.amount) + Number(keyObj[coin.denom]);
      return keyObj;
    }
    return { ...keyObj, [coin.denom]: Number(coin.amount) };
  }, {} as DenomKeyObj);
