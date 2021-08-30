import React from 'react';
import styled from 'styled-components';
import { GlobalProps, LayoutDisplayTypes } from '../../types';
import { MSG_SEND_LAYOUT } from './MsgSend';
import { ATS_LAYOUT, DIGITAL_CURRENCY_CONSORTIUM_LAYOUT } from './MsgExecuteContract';
import { MSG_EXECUTE_CONTRACT_GENERIC_LAYOUT } from './MsgExecuteContract/generic';
import { MSG_GENERIC_LAYOUT } from './generic';

const Wrapper = styled.div``;

export const LAYOUTS = {
  ...ATS_LAYOUT,
  ...DIGITAL_CURRENCY_CONSORTIUM_LAYOUT,
  ...MSG_SEND_LAYOUT,
  ...MSG_EXECUTE_CONTRACT_GENERIC_LAYOUT,
  ...MSG_GENERIC_LAYOUT,
};

type MessageLayoutProps = {
  typeName: keyof typeof LAYOUTS | string;
  layout: { [key in LayoutDisplayTypes]?: any };
  data: any;
} & GlobalProps;

const MessageLayout = ({ typeName, layout, data }: MessageLayoutProps) => (
  <Wrapper>
    {LAYOUTS[typeName as keyof typeof LAYOUTS] &&
      (LAYOUTS[typeName as keyof typeof LAYOUTS] as any).map(
        (layoutItem: { dataKey: string; displayType: LayoutDisplayTypes; label: string }) => {
          const { dataKey, displayType, label } = layoutItem;
          const Layout = layout[displayType];
          let displayData: any;
          if (dataKey === '*') {
            displayData = { ...data };
            delete displayData.typeName;
          } else displayData = data[dataKey];
          return Layout && displayData ? (
            <Layout key={`${dataKey}-${displayType}`} dataKey={dataKey} label={label} data={displayData} />
          ) : null;
        }
      )}
  </Wrapper>
);

export default MessageLayout;
