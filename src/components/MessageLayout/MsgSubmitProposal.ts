import { GlobalDisplay, LayoutDisplayTypes } from '../../types';
import { MsgSubmitProposalDisplay } from '../../types/messages';

export type MsgSubmitProposalLayout = {
  dataKey: keyof (MsgSubmitProposalDisplay & GlobalDisplay);
  displayType: LayoutDisplayTypes;
  label?: string;
}[];

export const MSG_SUBMIT_PROPOSAL_LAYOUT: { MsgSubmitProposal: MsgSubmitProposalLayout } = {
  MsgSubmitProposal: [
    {
      dataKey: 'proposalType',
      displayType: 'String',
      label: 'Proposal Type',
    },
    {
      dataKey: 'proposer',
      displayType: 'String',
      label: 'Proposer Address',
    },
    {
      dataKey: 'content',
      displayType: 'Json',
      label: 'Proposal Content',
    },
    {
      dataKey: 'initialDepositList',
      displayType: 'Coins',
      label: 'Initial Deposit',
    },
    {
      dataKey: 'balance',
      displayType: 'Coins',
      label: 'Account Balance',
    },
  ],
};
