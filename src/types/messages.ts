import { MsgSend } from '../proto/cosmos/bank/v1beta1/tx_pb';
import type { MsgVerifyInvariant } from '../proto/cosmos/crisis/v1beta1/tx_pb';
import type {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
  MsgFundCommunityPool,
} from '../proto/cosmos/distribution/v1beta1/tx_pb';

export type MsgSendDisplay = MsgSend.AsObject;
export type MsgVerifyInvariantDisplay = MsgVerifyInvariant.AsObject;
export type MsgSetWithdrawAddressDisplay = MsgSetWithdrawAddress.AsObject;
export type MsgWithdrawDelegatorRewardDisplay = MsgWithdrawDelegatorReward.AsObject;
export type MsgWithdrawValidatorCommissionDisplay = MsgWithdrawValidatorCommission.AsObject;
export type MsgFundCommunityPoolDisplay = MsgFundCommunityPool.AsObject;
