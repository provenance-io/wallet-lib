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
    ? (`MsgExecuteContract.ExecuteMsg.${Object.keys(msg)[0]}` as AtsLayoutNames)
    : 'MsgExecuteContractGeneric';
};

export const parseAtsData = ({ msg, fundsList }: MsgExecuteContractDisplay, version = 1) => {
  const type = Object.keys(msg)[0];
  const orderType = READABLE_TYPE_NAMES[type as keyof typeof READABLE_TYPE_NAMES] || '';
  const msgData = msg[type];
  if (['cancel_ask', 'cancel_bid'].includes(type))
    return {
      orderType,
      id: msgData.id,
    };
  const isBid = orderType === READABLE_TYPE_NAMES.create_bid;
  if (!orderType) return {};
  switch (version) {
    case 1: {
      if (!fundsList[0]) return {};
      const { amount, denom } = fundsList[0];
      const baseDenom: SupportedDenoms = isBid ? msgData.base : denom;
      const quoteDenom: SupportedDenoms = isBid ? denom : msgData.quote;
      const quantityRaw = isBid ? { amount: msgData.size, denom: baseDenom } : { amount, denom: baseDenom };
      const pricePerUnitRaw = { amount: msgData.price, denom: quoteDenom };
      const { amount: pricePerDisplayedUnitAmount } = decimalCoinConvert({ amount: msgData.price, denom: baseDenom });
      const pricePerDisplayedUnitRaw = { amount: pricePerDisplayedUnitAmount, denom: quoteDenom };
      const totalPriceRaw = isBid
        ? { amount, denom: quoteDenom }
        : { amount: Number(amount) * Number(msgData.price), denom: quoteDenom };
      return {
        baseDenom,
        quoteDenom,
        orderType,
        quantityRaw,
        pricePerUnitRaw,
        pricePerDisplayedUnitRaw,
        totalPriceRaw,
      };
    }
    case 2: {
      const baseDenom: SupportedDenoms = msgData.base;
      const quoteDenom: SupportedDenoms = msgData.quote;
      const quantityRaw = isBid ? { amount: msgData.size, denom: baseDenom } : { amount: msgData.size, denom: baseDenom };
      const pricePerDisplayedUnitRaw = isBid
        ? { amount: msgData.price, denom: quoteDenom }
        : { amount: msgData.price, denom: quoteDenom };
      const totalPriceRaw = isBid
        ? { amount: Number(msgData.size) * Number(msgData.price), denom: quoteDenom }
        : { amount: Number(msgData.size) * Number(msgData.price), denom: quoteDenom };
      return {
        baseDenom,
        quoteDenom,
        orderType,
        quantityRaw,
        pricePerDisplayedUnitRaw,
        totalPriceRaw,
      };
    }
    case 3: {
      const baseDenom: SupportedDenoms = msgData.base;
      const quoteDenom: SupportedDenoms = msgData.quote;
      const quantityRaw = isBid ? { amount: msgData.size, denom: baseDenom } : { amount: msgData.size, denom: baseDenom };
      const pricePerDisplayedUnitRaw = isBid
        ? { amount: msgData.price, denom: quoteDenom }
        : { amount: msgData.price, denom: quoteDenom };
      const totalPriceRaw =
        isBid && msgData.fee?.amount
          ? { amount: Number(msgData.size) * Number(msgData.price) + Number(msgData.fee.amount), denom: quoteDenom }
          : { amount: Number(msgData.size) * Number(msgData.price), denom: quoteDenom };
      const bidFeeRate = (Number(totalPriceRaw.amount) - Number(msgData.size) * Number(msgData.price)) / Number(totalPriceRaw.amount);
      return {
        baseDenom,
        quoteDenom,
        orderType,
        quantityRaw,
        pricePerDisplayedUnitRaw,
        totalPriceRaw,
        ...(isBid &&
          msgData.fee && {
            transactionFee: {
              ...(msgData.fee.amount && { amount: msgData.fee.amount }),
              ...(msgData.fee.denom && { denom: msgData.fee.denom }),
              ...(bidFeeRate && { rate: bidFeeRate }),
            },
          }),
      };
    }
    default:
      return {};
  }
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
      dataKey: 'balance',
      displayType: 'Coins',
      label: 'Hash Balance',
    },
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
      dataKey: 'memo',
      displayType: 'String',
      label: 'Memo',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Hash Fee',
    },
    {
      dataKey: 'disclaimer',
      displayType: 'Disclaimer',
    },
  ],
  'MsgExecuteContract.ExecuteMsg.create_bid': [
    {
      dataKey: 'balance',
      displayType: 'Coins',
      label: 'Hash Balance',
    },
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
      dataKey: 'transactionFee',
      displayType: 'TransactionFee',
      label: 'Transaction Fee',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Hash Fee',
    },
    {
      dataKey: 'totalPriceRaw',
      displayType: 'Coin',
      label: 'Total Purchase Price', // Total base
    },
    {
      dataKey: 'memo',
      displayType: 'String',
      label: 'Memo',
    },
    {
      dataKey: 'disclaimer',
      displayType: 'Disclaimer',
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
      dataKey: 'memo',
      displayType: 'String',
      label: 'Memo',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Hash Fee',
    },
    {
      dataKey: 'disclaimer',
      displayType: 'Disclaimer',
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
      dataKey: 'memo',
      displayType: 'String',
      label: 'Memo',
    },
    {
      dataKey: 'fee',
      displayType: 'Coin',
      label: 'Hash Fee',
    },
    {
      dataKey: 'disclaimer',
      displayType: 'Disclaimer',
    },
  ],
};
