import { GlobalDisplay, LayoutDisplayTypes } from '../../types';
import { MsgVoteWeightedDisplay } from '../../types/messages';

export type MsgVoteWeightedLayout = {
  dataKey: keyof (MsgVoteWeightedDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_VOTE_WEIGHTED_PROPOSAL_LAYOUT: { MsgVoteWeighted: MsgVoteWeightedLayout } = {
  MsgVoteWeighted: [
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
      dataKey: 'optionsList',
      displayType: 'Json',
      label: 'Voting Options',
    },
  ],
};
