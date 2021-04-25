import { MsgSendDisplay } from '../../services';
import { GlobalDisplay, LayoutDisplayTypes } from '../../types';

export type MsgSendLayout = {
  dataKey: keyof (MsgSendDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_SEND_LAYOUT: { MsgSend: MsgSendLayout } = {
  MsgSend: [
    {
      dataKey: 'from',
      displayType: 'String',
      label: 'From',
    },
    {
      dataKey: 'to',
      displayType: 'String',
      label: 'To',
    },
    {
      dataKey: 'amountList',
      displayType: 'Coins',
      label: 'Sending Amount',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
    {
      dataKey: 'balance',
      displayType: 'Coins',
      label: 'Account Balance',
    },
  ],
};
