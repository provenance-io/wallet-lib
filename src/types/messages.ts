import type { MsgSend } from '../proto/cosmos/bank/v1beta1/tx_pb';
import type { MsgVerifyInvariant } from '../proto/cosmos/crisis/v1beta1/tx_pb';
import type {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
  MsgFundCommunityPool,
} from '../proto/cosmos/distribution/v1beta1/tx_pb';
import { MsgVote, MsgVoteWeighted, MsgDeposit, MsgSubmitProposal } from '../proto/cosmos/gov/v1beta1/tx_pb';
import { MsgUnjail } from '../proto/cosmos/slashing/v1beta1/tx_pb';
import { MsgEditValidator, MsgDelegate, MsgBeginRedelegate, MsgUndelegate } from '../proto/cosmos/staking/v1beta1/tx_pb';
import { SoftwareUpgradeProposal, CancelSoftwareUpgradeProposal, Plan } from '../proto/cosmos/upgrade/v1beta1/upgrade_pb';
import { MsgCreateVestingAccount } from '../proto/cosmos/vesting/v1beta1/tx_pb';
import { Proposal, TextProposal } from '../proto/cosmos/gov/v1beta1/gov_pb';
import { MsgGrant } from '../proto/cosmos/authz/v1beta1/tx_pb';
import { Coin } from '../proto/cosmos/base/v1beta1/coin_pb';
import { StoreCodeProposal, InstantiateContractProposal } from 'proto/cosmwasm/wasm/v1/proposal_pb';
import { AccessConfig } from 'proto/cosmwasm/wasm/v1/types_pb';
import { ParameterChangeProposal } from 'proto/cosmos/params/v1beta1/params_pb';

export type MsgSendDisplay = MsgSend.AsObject;
export type MsgVerifyInvariantDisplay = MsgVerifyInvariant.AsObject;
export type MsgSetWithdrawAddressDisplay = MsgSetWithdrawAddress.AsObject;
export type MsgWithdrawDelegatorRewardDisplay = MsgWithdrawDelegatorReward.AsObject;
export type MsgWithdrawValidatorCommissionDisplay = MsgWithdrawValidatorCommission.AsObject;
export type MsgFundCommunityPoolDisplay = MsgFundCommunityPool.AsObject;
export type TextProposalDisplay = TextProposal.AsObject;
export type SoftwareUpgradeProposalDisplay = SoftwareUpgradeProposal.AsObject;
export type CancelSoftwareUpgradeProposalDisplay = CancelSoftwareUpgradeProposal.AsObject;
export type PlanDisplay = Plan.AsObject;
export type StoreCodeProposalDisplay = StoreCodeProposal.AsObject;
export type InstantiateContractProposalDisplay = InstantiateContractProposal.AsObject;
export type AccessConfigDisplay = AccessConfig.AsObject;
export type ParameterChangeProposalDisplay = ParameterChangeProposal.AsObject;
export type ProposalDisplay = Proposal.AsObject;
export type MsgVoteDisplay = MsgVote.AsObject;
export type MsgVoteWeightedDisplay = MsgVoteWeighted.AsObject;
export type MsgDepositDisplay = MsgDeposit.AsObject;
export type MsgUnjailDisplay = MsgUnjail.AsObject;
export type MsgEditValidatorDisplay = MsgEditValidator.AsObject;
export type MsgDelegateDisplay = MsgDelegate.AsObject;
export type MsgBeginRedelegateDisplay = MsgBeginRedelegate.AsObject;
export type MsgUndelegateDisplay = MsgUndelegate.AsObject;
export type MsgCreateVestingAccountDisplay = MsgCreateVestingAccount.AsObject;
export type MsgGrantDisplay = MsgGrant.AsObject & { transferLimit: Coin.AsObject };
export type MsgSubmitProposalDisplay = MsgSubmitProposal.AsObject & 
            { proposalType: 
              'TextProposal' | 
              'SoftwareUpgradeProposal' | 
              'CancelSoftwareUpgradeProposal' | 
              'StoreCodeProposal' |
              'InstantiateCodeProposal' |
              'ParameterChangeProposal' |
              undefined };

