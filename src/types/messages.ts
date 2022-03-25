import type { MsgSend } from '../proto/cosmos/bank/v1beta1/tx_pb';
import type { MsgVerifyInvariant } from '../proto/cosmos/crisis/v1beta1/tx_pb';
import type {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
  MsgFundCommunityPool,
} from '../proto/cosmos/distribution/v1beta1/tx_pb';
import { MsgVote, MsgVoteWeighted, MsgDeposit } from '../proto/cosmos/gov/v1beta1/tx_pb';
import { MsgUnjail } from '../proto/cosmos/slashing/v1beta1/tx_pb';
import { MsgEditValidator, MsgDelegate, MsgBeginRedelegate, MsgUndelegate } from '../proto/cosmos/staking/v1beta1/tx_pb';
import { MsgCreateVestingAccount } from '../proto/cosmos/vesting/v1beta1/tx_pb';
import { Proposal } from '../proto/cosmos/gov/v1beta1/gov_pb';
import { MsgGrant } from '../proto/cosmos/authz/v1beta1/tx_pb';
import { Coin } from '../proto/cosmos/base/v1beta1/coin_pb';

export type MsgSendDisplay = MsgSend.AsObject;
export type MsgVerifyInvariantDisplay = MsgVerifyInvariant.AsObject;
export type MsgSetWithdrawAddressDisplay = MsgSetWithdrawAddress.AsObject;
export type MsgWithdrawDelegatorRewardDisplay = MsgWithdrawDelegatorReward.AsObject;
export type MsgWithdrawValidatorCommissionDisplay = MsgWithdrawValidatorCommission.AsObject;
export type MsgFundCommunityPoolDisplay = MsgFundCommunityPool.AsObject;
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
