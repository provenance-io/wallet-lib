import { CoinAsObject, SupportedDenoms } from '../types';

type DenomKeyObj = {
  [key in SupportedDenoms | string]: number;
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
