import { ExecuteMsg } from '../../../types/schema/ats-smart-contract/execute_msg';
import { MsgExecuteContractDisplay } from '../../../services';
import { GlobalDisplay, LayoutDisplayTypes } from '../../../types';
import { getReadableDenom } from '../../../constants';

export type AtsLayoutNames = 'MsgExecuteContract.ExecuteMsg.create_ask' | 'MsgExecuteContract.ExecuteMsg.create_bid';

const READABLE_TYPE_NAMES = {
  create_ask: 'Sell',
  create_bid: 'Buy',
};

export const getAtsLayoutTypeName = (msg: ExecuteMsg) => `MsgExecuteContract.ExecuteMsg.${Object.keys(msg)[0]}`;

export const parseAtsData = ({ msg, funds }: MsgExecuteContractDisplay) => {
  const type = Object.keys(msg)[0];
  const orderType = READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES] || '';
  const msgData = msg[type];
  const isBid = orderType === READABLE_TYPE_NAMES.create_bid;
  if (!orderType || !funds[0]) return {};
  const { amount, denom } = funds[0];
  const base = isBid ? getReadableDenom(msgData.base) : getReadableDenom(denom);
  const quote = isBid ? getReadableDenom(denom) : getReadableDenom(msgData.quote);
  return {
    orderType,
    quantity: isBid ? `${msgData.size} ${base}` : `${amount} ${base}`,
    pricePerUnit: `${msgData.price} ${quote}`,
    totalPrice: isBid ? `${amount} ${quote}` : `${amount * Number(msgData.price)} ${quote}`,
  };
};

type CreateAskLayout = {
  dataKey: keyof ReturnType<typeof parseAtsData> | keyof GlobalDisplay | keyof ExecuteMsg['create_ask'];
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

type CreateBidLayout = {
  dataKey: keyof MsgExecuteContractDisplay | keyof GlobalDisplay | ExecuteMsg['create_bid'];
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const ATS_LAYOUT: { [key in AtsLayoutNames]: CreateAskLayout | CreateBidLayout } = {
  'MsgExecuteContract.ExecuteMsg.create_ask': [
    {
      dataKey: 'status',
      displayType: 'String',
      label: 'Status',
    },
    {
      dataKey: 'orderType',
      displayType: 'String',
      label: 'Order Type', // Sell
    },
    {
      dataKey: 'quantity',
      displayType: 'String',
      label: 'Amount', // Amount base
    },
    {
      dataKey: 'pricePerUnit',
      displayType: 'String',
      label: 'Price Per Unit', // Price in quote
    },
    {
      dataKey: 'total',
      displayType: 'String',
      label: 'Total Sale Price', // Total quote
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
  'MsgExecuteContract.ExecuteMsg.create_bid': [
    {
      dataKey: 'status',
      displayType: 'String',
      label: 'Status',
    },
    {
      dataKey: 'orderType',
      displayType: 'String',
      label: 'Order Type', // Buy
    },
    {
      dataKey: 'quantity',
      displayType: 'String',
      label: 'Amount', // Amount quote
    },
    {
      dataKey: 'pricePerUnit',
      displayType: 'String',
      label: 'Price Per Unit', // Price base
    },
    {
      dataKey: 'total',
      displayType: 'String',
      label: 'Total Purchase Price', // Total base
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
};
