import { GlobalDisplay, LayoutDisplayTypes } from '../../types';
import { MsgVoteDisplay } from '../../types/messages';

export type MsgVoteLayout = {
  dataKey: keyof (MsgVoteDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_VOTE_LAYOUT: { MsgVote: MsgVoteLayout } = {
  MsgVote: [
    {
      dataKey: 'proposalId',
      displayType: 'String',
      label: 'Proposer Address',
    },
    {
      dataKey: 'voter',
      displayType: 'String',
      label: 'Voter Address',
    },
    {
      dataKey: 'option',
      displayType: 'String',
      label: 'Vote Option',
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
