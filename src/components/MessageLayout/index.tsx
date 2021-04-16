import React from 'react';
import styled from 'styled-components';
import { CoinAsObject, GlobalProps } from '../../types';
import { MsgSendDisplay, ReadableMessageNames } from '../../services';

const Wrapper = styled.div``;

type SharedComponentProps = {
  label: string;
  dataKey: string;
};

export type LayoutDisplayComponentProps = {
  Address: {
    data: string;
  } & SharedComponentProps;
  Coin: {
    data: CoinAsObject;
  } & SharedComponentProps;
  Coins: {
    data: CoinAsObject[];
  } & SharedComponentProps;
};

export type LayoutDisplayTypes = keyof LayoutDisplayComponentProps;

type GlobalDisplay = {
  fee: CoinAsObject;
  balance: CoinAsObject;
};

type MsgSendLayout = {
  dataKey: keyof (MsgSendDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const LAYOUTS: { [key in ReadableMessageNames]: MsgSendLayout } = {
  MsgSend: [
    {
      dataKey: 'from',
      displayType: 'Address',
      label: 'From',
    },
    {
      dataKey: 'to',
      displayType: 'Address',
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

type MessageLayoutProps = {
  typeName: ReadableMessageNames;
  layout: Partial<{ [key in LayoutDisplayTypes]: any }>;
  data: any;
} & GlobalProps;

const MessageLayout = ({ typeName, layout, data }: MessageLayoutProps) => (
  <Wrapper>
    {LAYOUTS[typeName] &&
      LAYOUTS[typeName].map(({ dataKey, displayType, label }) => {
        const Layout = layout[displayType];
        return Layout && data[dataKey] ? (
          <Layout key={`${dataKey}-${displayType}`} dataKey={dataKey} label={label} data={data[dataKey]} />
        ) : null;
      })}
  </Wrapper>
);

export default MessageLayout;
