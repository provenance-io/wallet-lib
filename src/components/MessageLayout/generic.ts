import { GlobalDisplay, LayoutDisplayTypes } from '../../types';

type MsgGenericLayout = {
  dataKey: keyof GlobalDisplay | '*';
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_GENERIC_LAYOUT: { MsgGeneric: MsgGenericLayout } = {
  MsgGeneric: [
    {
      dataKey: 'balance',
      displayType: 'Coins',
      label: 'Account Balance',
    },
    { dataKey: '*', displayType: 'Json', label: 'Message' },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
};
