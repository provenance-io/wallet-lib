import React from 'react';
import styled from 'styled-components';
import { CoinAsObject, GlobalProps } from '../../types';
import { MsgSendDisplay, ReadableMessageNames } from '../../services';

const Wrapper = styled.div``;

type SharedComponentProps = {
  label: string;
  key: string;
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
};

type MsgSendLayout = {
  key: keyof (MsgSendDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const LAYOUTS: { [key in ReadableMessageNames]: MsgSendLayout } = {
  MsgSend: [
    {
      key: 'from',
      displayType: 'Address',
      label: 'From',
    },
    {
      key: 'to',
      displayType: 'Address',
      label: 'To',
    },
    {
      key: 'amountList',
      displayType: 'Coins',
      label: 'Sending Amount',
    },
    {
      key: 'fee',
      displayType: 'Coin',
      label: 'Fee',
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
      LAYOUTS[typeName].map(({ key, displayType, label }) => {
        const Layout = layout[displayType];
        return Layout && data[key] ? <Layout key={key} label={label} data={data[key]} /> : null;
      })}
  </Wrapper>
);

export default MessageLayout;
