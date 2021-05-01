import { GlobalDisplay, LayoutDisplayTypes } from '../../../types';
import { MsgExecuteContractDisplay } from '../../../services';

type MsgExecuteContractGenericLayout = {
  dataKey: keyof (MsgExecuteContractDisplay & GlobalDisplay) | '*';
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_EXECUTE_CONTRACT_GENERIC_LAYOUT: { MsgExecuteContractGeneric: MsgExecuteContractGenericLayout } = {
  MsgExecuteContractGeneric: [
    { dataKey: 'sender', displayType: 'String', label: 'Sender' },
    {
      dataKey: 'balance',
      displayType: 'Coin',
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
