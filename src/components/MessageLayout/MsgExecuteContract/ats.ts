import { ExecuteMsg } from '../../../types/schema/ats-smart-contract/execute_msg';
import { MsgExecuteContractDisplay } from '../../../services';
import { GlobalDisplay, LayoutDisplayTypes, SupportedDenoms } from '../../../types';
import { decimalCoinConvert } from '../../../utils';

export type AtsLayoutNames =
  | 'MsgExecuteContract.ExecuteMsg.create_ask'
  | 'MsgExecuteContract.ExecuteMsg.create_bid'
  | 'MsgExecuteContract.ExecuteMsg.cancel_bid'
  | 'MsgExecuteContract.ExecuteMsg.cancel_ask';

const READABLE_TYPE_NAMES = {
  create_ask: 'Sell',
  create_bid: 'Buy',
  cancel_bid: 'Cancel Buy',
  cancel_ask: 'Cancel Sell',
};

export const getAtsLayoutTypeName = ({ msg }: MsgExecuteContractDisplay) => {
  const type = Object.keys(msg)[0];
  return READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES]
    ? `MsgExecuteContract.ExecuteMsg.${Object.keys(msg)[0]}`
    : 'MsgExecuteContractGeneric';
};

export const parseAtsData = ({ msg, funds }: MsgExecuteContractDisplay) => {
  const type = Object.keys(msg)[0];
  const orderType = READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES] || '';
  const msgData = msg[type];
  if (['cancel_ask', 'cancel_bid'].includes(type))
    return {
      orderType,
      id: msgData.id,
    };
  const isBid = orderType === READABLE_TYPE_NAMES.create_bid;
  if (!orderType || !funds[0]) return {};
  const { amount, denom } = funds[0];
  const baseDenom: SupportedDenoms = isBid ? msgData.base : denom;
  const quoteDenom: SupportedDenoms = isBid ? denom : msgData.quote;
  const quantityRaw = isBid ? { amount: msgData.size, denom: baseDenom } : { amount, denom: baseDenom };
  const pricePerUnitRaw = { amount: msgData.price, denom: quoteDenom };
  const { amount: pricePerDisplayedUnitAmount } = decimalCoinConvert({ amount: msgData.price, denom: baseDenom });
  const pricePerDisplayedUnitRaw = { amount: pricePerDisplayedUnitAmount, denom: quoteDenom };
  const totalPriceRaw = isBid ? { amount, denom: quoteDenom } : { amount: amount * Number(msgData.price), denom: quoteDenom };
  return {
    baseDenom,
    quoteDenom,
    orderType,
    quantityRaw,
    pricePerUnitRaw,
    pricePerDisplayedUnitRaw,
    totalPriceRaw,
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
      dataKey: 'quantityRaw',
      displayType: 'Coin',
      label: 'Amount', // Amount base
    },
    {
      dataKey: 'pricePerDisplayedUnitRaw',
      displayType: 'Coin',
      label: 'Price Per Unit', // Price in quote
    },
    {
      dataKey: 'totalPriceRaw',
      displayType: 'Coin',
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
      dataKey: 'quantityRaw',
      displayType: 'Coin',
      label: 'Amount', // Amount quote
    },
    {
      dataKey: 'pricePerDisplayedUnitRaw',
      displayType: 'Coin',
      label: 'Price Per Unit', // Price base
    },
    {
      dataKey: 'totalPriceRaw',
      displayType: 'Coin',
      label: 'Total Purchase Price', // Total base
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
  'MsgExecuteContract.ExecuteMsg.cancel_bid': [
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
      dataKey: 'id',
      displayType: 'String',
      label: 'Order ID', // Buy
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
  'MsgExecuteContract.ExecuteMsg.cancel_ask': [
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
      dataKey: 'id',
      displayType: 'String',
      label: 'Order ID', // Buy
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Fee',
    },
  ],
};
