import { MsgExecuteContractDisplay } from '../../../services';
import { GlobalDisplay, LayoutDisplayTypes } from '../../../types';

export type DigitalCurrencyConsortiumLayoutNames = 'MsgExecuteContract.ExecuteMsg.transfer';

const READABLE_TYPE_NAMES = {
  transfer: 'Transfer',
};

export const getDigitalCurrencyConsortiumLayoutTypeName = ({ msg }: MsgExecuteContractDisplay) => {
  const type = Object.keys(msg)[0];
  return READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES]
    ? (`MsgExecuteContract.ExecuteMsg.${Object.keys(msg)[0]}` as DigitalCurrencyConsortiumLayoutNames)
    : 'MsgExecuteContractGeneric';
};

export const parseDigitalCurrencyConsortiumData = ({ msg, sender }: MsgExecuteContractDisplay) => {
  const type = Object.keys(msg)[0];
  const orderType = READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES] || '';
  const msgData = msg[type] as any;
  switch (type) {
    case 'transfer': {
      const { amount, recipient } = msgData;
      return {
        sender,
        orderType,
        transferAmount: { amount: amount as string, denom: 'usdf.c' },
        to: recipient as string,
      };
    }
    default:
      return {};
  }
};

type TransferLayout = {
  dataKey: keyof ReturnType<typeof parseDigitalCurrencyConsortiumData> | keyof GlobalDisplay;
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const DIGITAL_CURRENCY_CONSORTIUM_LAYOUT: { [key in DigitalCurrencyConsortiumLayoutNames]: TransferLayout } = {
  'MsgExecuteContract.ExecuteMsg.transfer': [
    {
      dataKey: 'orderType',
      displayType: 'String',
      label: 'Transaction',
    },
    {
      dataKey: 'sender',
      displayType: 'String',
      label: 'From',
    },
    {
      dataKey: 'to',
      displayType: 'String',
      label: 'To',
    },
    {
      dataKey: 'transferAmount',
      displayType: 'Coin',
      label: 'Sending Amount',
    },
    {
      dataKey: 'memo',
      displayType: 'String',
      label: 'Memo',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
};
