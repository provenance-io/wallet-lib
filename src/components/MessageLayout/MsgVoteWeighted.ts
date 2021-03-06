import { GlobalDisplay, LayoutDisplayTypes } from '../../types';
import { MsgVoteWeightedDisplay } from '../../types/messages';

export type MsgVoteWeightedLayout = {
  dataKey: keyof (MsgVoteWeightedDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_VOTE_WEIGHTED_LAYOUT: { MsgVoteWeighted: MsgVoteWeightedLayout } = {
  MsgVoteWeighted: [
    {
      dataKey: 'proposalId',
      displayType: 'String',
      label: 'Proposal ID',
    },
    {
      dataKey: 'voter',
      displayType: 'String',
      label: 'Voter Address',
    },
    {
      dataKey: 'optionsList',
      displayType: 'Json',
      label: 'Voting Options',
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
