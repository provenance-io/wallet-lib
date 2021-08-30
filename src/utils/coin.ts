import Big from 'big.js';
import { CoinAsObject, SupportedDenoms } from '../types';

type DenomKeyObj = {
  [key in SupportedDenoms | string]: number;
};

type CoinDecimal = { denom: SupportedDenoms; decimal: Big; decimalPlaces: number };

export const COIN_DECIMAL_MAP: { [key in SupportedDenoms]?: CoinDecimal } = {
  nhash: {
    denom: 'hash',
    decimal: Big(1e9),
    decimalPlaces: 9,
  },
  exchangesc: {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
  cfigureomni: {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
  cfigure: {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
  'usdf.c': {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
  'usdf.test': {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
  'usdf.coin': {
    denom: 'usd',
    decimal: Big(1e2),
    decimalPlaces: 2,
  },
};

export const coinDecimalConvert = (coin: CoinAsObject): CoinAsObject => {
  const { denom, amount } = coin;
  const map = COIN_DECIMAL_MAP[denom as keyof typeof COIN_DECIMAL_MAP];
  if (map) {
    return {
      denom: map.denom,
      amount: Big(amount).div(map.decimal).toFixed(map.decimalPlaces),
    };
  }
  return coin;
};

export const decimalCoinConvert = (coin: CoinAsObject): CoinAsObject => {
  const { denom, amount } = coin;
  const map = COIN_DECIMAL_MAP[denom as keyof typeof COIN_DECIMAL_MAP];
  if (map) {
    return {
      denom: map.denom,
      amount: Big(amount).times(map.decimal).toString(),
    };
  }
  return coin;
};

export const coinListToDenomKeyObj = (list: CoinAsObject[]) =>
  list.reduce((keyObj, coin) => {
    if (keyObj[coin.denom]) {
      // eslint-disable-next-line
      keyObj[coin.denom] = Big(coin.amount).plus(keyObj[coin.denom]).toNumber();
      return keyObj;
    }
    return { ...keyObj, [coin.denom]: Number(coin.amount) };
  }, {} as DenomKeyObj);
