import { ExecuteMsg } from '../../../types/schema/ats-smart-contract/execute_msg';
import { MsgExecuteContractDisplay } from '../../../services';
import { GlobalDisplay, LayoutDisplayTypes, SupportedDenoms } from '../../../types';
import { getReadableDenom } from '../../../constants';
import { coinDecimalConvert, decimalCoinConvert } from '../../../utils';

export type AtsLayoutNames = 'MsgExecuteContract.ExecuteMsg.create_ask' | 'MsgExecuteContract.ExecuteMsg.create_bid';

const READABLE_TYPE_NAMES = {
  create_ask: 'Sell',
  create_bid: 'Buy',
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
  const isBid = orderType === READABLE_TYPE_NAMES.create_bid;
  if (!orderType || !funds[0]) return {};
  const { amount, denom } = funds[0];
  const baseDenom: SupportedDenoms = isBid ? msgData.base : denom;
  const quoteDenom: SupportedDenoms = isBid ? denom : msgData.quote;
  const quantityRaw = isBid ? { amount: msgData.size, denom: baseDenom } : { amount, denom: baseDenom };
  const quantity = coinDecimalConvert(quantityRaw);
  const { amount: pricePerDisplayedUnit } = decimalCoinConvert({ amount: msgData.price, denom: baseDenom });
  const pricePerUnitRaw = { amount: pricePerDisplayedUnit, denom: quoteDenom };
  const pricePerUnit = coinDecimalConvert(pricePerUnitRaw);
  const totalPriceRaw = isBid ? { amount, denom: quoteDenom } : { amount: amount * Number(msgData.price), denom: quoteDenom };
  const totalPrice = coinDecimalConvert(totalPriceRaw);
  return {
    baseDenom,
    quoteDenom,
    orderType,
    quantityRaw,
    pricePerUnitRaw,
    totalPriceRaw,
    quantity: `${quantity.amount} ${getReadableDenom(quantity.denom)}`,
    pricePerUnit: `${pricePerUnit.amount} ${getReadableDenom(pricePerUnit.denom)}`,
    totalPrice: `${totalPrice.amount} ${getReadableDenom(totalPrice.denom)}`,
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
      dataKey: 'pricePerUnitRaw',
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
      dataKey: 'pricePerUnitRaw',
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
};
