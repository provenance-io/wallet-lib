import type { Wallet } from '@tendermint/sig';
import type { Bytes } from '@tendermint/types';
import * as google_protobuf_any_pb from 'google-protobuf/google/protobuf/any_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { Message } from 'google-protobuf';
import { ecdsaSign as secp256k1EcdsaSign } from 'secp256k1';
import { createHash } from 'crypto';
import { base64ToBytes, bufferToBytes, bytesToBase64 } from '@tendermint/belt';

import { log } from '../utils';
import {
  AtsMessage,
  CoinAsObject,
  MsgDepositDisplay,
  MsgFundCommunityPoolDisplay,
  MsgSendDisplay,
  MsgSetWithdrawAddressDisplay,
  MsgUnjailDisplay,
  MsgVerifyInvariantDisplay,
  MsgVoteDisplay,
  MsgWithdrawDelegatorRewardDisplay,
  MsgWithdrawValidatorCommissionDisplay,
  SupportedDenoms,
  MsgEditValidatorDisplay,
  MsgDelegateDisplay,
  MsgBeginRedelegateDisplay,
  MsgUndelegateDisplay,
  MsgCreateVestingAccountDisplay,
  MsgGrantDisplay,
} from '../types';
import type { ExecuteMsg as DigitalCurrencyConsortiumExecuteMsg } from '../types/schema/digital-currency-consortium/execute_msg';
import { AuthInfo, Fee, ModeInfo, SignDoc, SignerInfo, TxBody, TxRaw } from '../proto/cosmos/tx/v1beta1/tx_pb';
import { BroadcastMode, BroadcastTxRequest, SimulateRequest } from '../proto/cosmos/tx/v1beta1/service_pb';
import { MsgSend } from '../proto/cosmos/bank/v1beta1/tx_pb';
import { Coin } from '../proto/cosmos/base/v1beta1/coin_pb';
import { SignMode } from '../proto/cosmos/tx/signing/v1beta1/signing_pb';
import { BaseAccount } from '../proto/cosmos/auth/v1beta1/auth_pb';
import { PubKey } from '../proto/cosmos/crypto/secp256k1/keys_pb';
import { MsgExecuteContract } from '../proto/cosmwasm/wasm/v1/tx_pb';
import { MsgVerifyInvariant } from '../proto/cosmos/crisis/v1beta1/tx_pb';
import {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
  MsgFundCommunityPool,
} from '../proto/cosmos/distribution/v1beta1/tx_pb';
import { MsgSubmitEvidence } from '../proto/cosmos/evidence/v1beta1/tx_pb';
import { MsgSubmitProposal, MsgVote, MsgDeposit } from '../proto/cosmos/gov/v1beta1/tx_pb';
import { MsgUnjail } from '../proto/cosmos/slashing/v1beta1/tx_pb';
import {
  MsgCreateValidator,
  MsgEditValidator,
  MsgDelegate,
  MsgBeginRedelegate,
  MsgUndelegate,
} from '../proto/cosmos/staking/v1beta1/tx_pb';
import { MsgCreateVestingAccount } from '../proto/cosmos/vesting/v1beta1/tx_pb';
import { CommissionRates, Description } from '../proto/cosmos/staking/v1beta1/staking_pb';
import { Evidence, Validator } from '../proto/tendermint/abci/types_pb';
import { Proposal } from '../proto/cosmos/gov/v1beta1/gov_pb';
import { MsgGrant } from '../proto/cosmos/authz/v1beta1/tx_pb';
import { Grant } from '../proto/cosmos/authz/v1beta1/authz_pb';
import { MarkerTransferAuthorization } from '../proto/provenance/marker/v1/authz_pb';

import {
  MsgAddAttributeRequest,
  MsgDeleteAttributeRequest,
  MsgDeleteDistinctAttributeRequest,
  MsgUpdateAttributeRequest,
} from '../proto/provenance/attribute/v1/tx_pb';

import {
  MsgActivateRequest,
  MsgAddAccessRequest,
  MsgAddMarkerRequest,
  MsgBurnRequest,
  MsgCancelRequest,
  MsgDeleteAccessRequest,
  MsgDeleteRequest,
  MsgFinalizeRequest,
  MsgMintRequest,
  MsgSetDenomMetadataRequest,
  MsgTransferRequest,
  MsgWithdrawRequest,
} from '../proto/provenance/marker/v1/tx_pb';

import {
  MsgAddContractSpecToScopeSpecRequest,
  MsgAddScopeDataAccessRequest,
  MsgAddScopeOwnerRequest,
  MsgBindOSLocatorRequest,
  MsgDeleteContractSpecFromScopeSpecRequest,
  MsgDeleteContractSpecificationRequest,
  MsgDeleteOSLocatorRequest,
  MsgDeleteRecordRequest,
  MsgDeleteRecordSpecificationRequest,
  MsgDeleteScopeDataAccessRequest,
  MsgDeleteScopeOwnerRequest,
  MsgDeleteScopeRequest,
  MsgDeleteScopeSpecificationRequest,
  MsgModifyOSLocatorRequest,
  MsgP8eMemorializeContractRequest,
  MsgWriteContractSpecificationRequest,
  MsgWriteP8eContractSpecRequest,
  MsgWriteRecordRequest,
  MsgWriteRecordSpecificationRequest,
  MsgWriteScopeRequest,
  MsgWriteScopeSpecificationRequest,
  MsgWriteSessionRequest,
} from '../proto/provenance/metadata/v1/tx_pb';

import { MsgBindNameRequest, MsgDeleteNameRequest } from '../proto/provenance/name/v1/tx_pb';

type SupportedMessageTypeNames =
  | 'cosmos.authz.v1beta1.MsgGrant'
  | 'cosmos.bank.v1beta1.MsgSend'
  | 'cosmos.crisis.v1beta1.MsgVerifyInvariant'
  | 'cosmos.crypto.secp256k1.PubKey'
  | 'cosmos.distribution.v1beta1.MsgFundCommunityPool'
  | 'cosmos.distribution.v1beta1.MsgSetWithdrawAddress'
  | 'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'
  | 'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'
  | 'cosmos.evidence.v1beta1.MsgSubmitEvidence'
  | 'cosmos.gov.v1beta1.MsgDeposit'
  | 'cosmos.gov.v1beta1.MsgSubmitProposal'
  | 'cosmos.gov.v1beta1.MsgVote'
  | 'cosmos.gov.v1beta1.Proposal'
  | 'cosmos.slashing.v1beta1.MsgUnjail'
  | 'cosmos.staking.v1beta1.MsgBeginRedelegate'
  | 'cosmos.staking.v1beta1.MsgCreateValidator'
  | 'cosmos.staking.v1beta1.MsgDelegate'
  | 'cosmos.staking.v1beta1.MsgEditValidator'
  | 'cosmos.staking.v1beta1.MsgUndelegate'
  | 'cosmos.vesting.v1beta1.MsgCreateVestingAccount'
  | 'cosmwasm.wasm.v1.MsgExecuteContract'
  | 'provenance.attribute.v1.MsgAddAttributeRequest'
  | 'provenance.attribute.v1.MsgDeleteAttributeRequest'
  | 'provenance.attribute.v1.MsgDeleteDistinctAttributeRequest'
  | 'provenance.attribute.v1.MsgUpdateAttributeRequest'
  | 'provenance.marker.v1.authz.MarkerTransferAuthorization'
  | 'provenance.marker.v1.MsgActivateRequest'
  | 'provenance.marker.v1.MsgAddAccessRequest'
  | 'provenance.marker.v1.MsgAddMarkerRequest'
  | 'provenance.marker.v1.MsgBurnRequest'
  | 'provenance.marker.v1.MsgCancelRequest'
  | 'provenance.marker.v1.MsgDeleteAccessRequest'
  | 'provenance.marker.v1.MsgDeleteRequest'
  | 'provenance.marker.v1.MsgFinalizeRequest'
  | 'provenance.marker.v1.MsgMintRequest'
  | 'provenance.marker.v1.MsgSetDenomMetadataRequest'
  | 'provenance.marker.v1.MsgTransferRequest'
  | 'provenance.marker.v1.MsgWithdrawRequest'
  | 'provenance.metadata.v1.MsgAddContractSpecToScopeSpecRequest'
  | 'provenance.metadata.v1.MsgAddScopeDataAccessRequest'
  | 'provenance.metadata.v1.MsgAddScopeOwnerRequest'
  | 'provenance.metadata.v1.MsgBindOSLocatorRequest'
  | 'provenance.metadata.v1.MsgDeleteContractSpecFromScopeSpecRequest'
  | 'provenance.metadata.v1.MsgDeleteContractSpecificationRequest'
  | 'provenance.metadata.v1.MsgDeleteOSLocatorRequest'
  | 'provenance.metadata.v1.MsgDeleteRecordRequest'
  | 'provenance.metadata.v1.MsgDeleteRecordSpecificationRequest'
  | 'provenance.metadata.v1.MsgDeleteScopeDataAccessRequest'
  | 'provenance.metadata.v1.MsgDeleteScopeOwnerRequest'
  | 'provenance.metadata.v1.MsgDeleteScopeRequest'
  | 'provenance.metadata.v1.MsgDeleteScopeSpecificationRequest'
  | 'provenance.metadata.v1.MsgModifyOSLocatorRequest'
  | 'provenance.metadata.v1.MsgP8eMemorializeContractRequest'
  | 'provenance.metadata.v1.MsgWriteContractSpecificationRequest'
  | 'provenance.metadata.v1.MsgWriteP8eContractSpecRequest'
  | 'provenance.metadata.v1.MsgWriteRecordRequest'
  | 'provenance.metadata.v1.MsgWriteRecordSpecificationRequest'
  | 'provenance.metadata.v1.MsgWriteScopeRequest'
  | 'provenance.metadata.v1.MsgWriteScopeSpecificationRequest'
  | 'provenance.metadata.v1.MsgWriteSessionRequest'
  | 'provenance.name.v1.MsgBindNameRequest'
  | 'provenance.name.v1.MsgDeleteNameRequest'
  | 'tendermint.abci.Evidence';

export type ReadableMessageNames =
  | 'MsgGrant'
  | 'MsgSend'
  | 'MsgVerifyInvariant'
  | 'PubKey'
  | 'MsgFundCommunityPool'
  | 'MsgSetWithdrawAddress'
  | 'MsgWithdrawDelegatorReward'
  | 'MsgWithdrawValidatorCommission'
  | 'MsgSubmitEvidence'
  | 'MsgDeposit'
  | 'MsgSubmitProposal'
  | 'MsgVote'
  | 'Proposal'
  | 'MsgUnjail'
  | 'MsgBeginRedelegate'
  | 'MsgCreateValidator'
  | 'MsgDelegate'
  | 'MsgEditValidator'
  | 'MsgUndelegate'
  | 'MsgCreateVestingAccount'
  | 'MsgExecuteContract'
  | 'MsgAddAttributeRequest'
  | 'MsgDeleteAttributeRequest'
  | 'MsgDeleteDistinctAttributeRequest'
  | 'MsgUpdateAttributeRequest'
  | 'MarkerTransferAuthorization'
  | 'MsgActivateRequest'
  | 'MsgAddAccessRequest'
  | 'MsgAddMarkerRequest'
  | 'MsgBurnRequest'
  | 'MsgCancelRequest'
  | 'MsgDeleteAccessRequest'
  | 'MsgDeleteRequest'
  | 'MsgFinalizeRequest'
  | 'MsgMintRequest'
  | 'MsgSetDenomMetadataRequest'
  | 'MsgTransferRequest'
  | 'MsgWithdrawRequest'
  | 'MsgAddContractSpecToScopeSpecRequest'
  | 'MsgAddScopeDataAccessRequest'
  | 'MsgAddScopeOwnerRequest'
  | 'MsgBindOSLocatorRequest'
  | 'MsgDeleteContractSpecFromScopeSpecRequest'
  | 'MsgDeleteContractSpecificationRequest'
  | 'MsgDeleteOSLocatorRequest'
  | 'MsgDeleteRecordRequest'
  | 'MsgDeleteRecordSpecificationRequest'
  | 'MsgDeleteScopeDataAccessRequest'
  | 'MsgDeleteScopeOwnerRequest'
  | 'MsgDeleteScopeRequest'
  | 'MsgDeleteScopeSpecificationRequest'
  | 'MsgModifyOSLocatorRequest'
  | 'MsgP8eMemorializeContractRequest'
  | 'MsgWriteContractSpecificationRequest'
  | 'MsgWriteP8eContractSpecRequest'
  | 'MsgWriteRecordRequest'
  | 'MsgWriteRecordSpecificationRequest'
  | 'MsgWriteScopeRequest'
  | 'MsgWriteScopeSpecificationRequest'
  | 'MsgWriteSessionRequest'
  | 'MsgBindNameRequest'
  | 'MsgDeleteNameRequest'
  | 'Evidence';

export type FallbackGenericMessageName = 'MsgGeneric' | 'MsgExecuteContractGeneric';

const TYPE_NAMES_READABLE_MAP: { [key in ReadableMessageNames]: SupportedMessageTypeNames } = {
  MsgGrant: 'cosmos.authz.v1beta1.MsgGrant',
  MsgSend: 'cosmos.bank.v1beta1.MsgSend',
  MsgVerifyInvariant: 'cosmos.crisis.v1beta1.MsgVerifyInvariant',
  PubKey: 'cosmos.crypto.secp256k1.PubKey',
  MsgFundCommunityPool: 'cosmos.distribution.v1beta1.MsgFundCommunityPool',
  MsgSetWithdrawAddress: 'cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  MsgWithdrawDelegatorReward: 'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MsgWithdrawValidatorCommission: 'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  MsgSubmitEvidence: 'cosmos.evidence.v1beta1.MsgSubmitEvidence',
  MsgDeposit: 'cosmos.gov.v1beta1.MsgDeposit',
  MsgSubmitProposal: 'cosmos.gov.v1beta1.MsgSubmitProposal',
  MsgVote: 'cosmos.gov.v1beta1.MsgVote',
  Proposal: 'cosmos.gov.v1beta1.Proposal',
  MsgUnjail: 'cosmos.slashing.v1beta1.MsgUnjail',
  MsgBeginRedelegate: 'cosmos.staking.v1beta1.MsgBeginRedelegate',
  MsgCreateValidator: 'cosmos.staking.v1beta1.MsgCreateValidator',
  MsgDelegate: 'cosmos.staking.v1beta1.MsgDelegate',
  MsgEditValidator: 'cosmos.staking.v1beta1.MsgEditValidator',
  MsgUndelegate: 'cosmos.staking.v1beta1.MsgUndelegate',
  MsgCreateVestingAccount: 'cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  MsgExecuteContract: 'cosmwasm.wasm.v1.MsgExecuteContract',
  MsgAddAttributeRequest: 'provenance.attribute.v1.MsgAddAttributeRequest',
  MsgDeleteAttributeRequest: 'provenance.attribute.v1.MsgDeleteAttributeRequest',
  MsgDeleteDistinctAttributeRequest: 'provenance.attribute.v1.MsgDeleteDistinctAttributeRequest',
  MsgUpdateAttributeRequest: 'provenance.attribute.v1.MsgUpdateAttributeRequest',
  MarkerTransferAuthorization: 'provenance.marker.v1.authz.MarkerTransferAuthorization',
  MsgActivateRequest: 'provenance.marker.v1.MsgActivateRequest',
  MsgAddAccessRequest: 'provenance.marker.v1.MsgAddAccessRequest',
  MsgAddMarkerRequest: 'provenance.marker.v1.MsgAddMarkerRequest',
  MsgBurnRequest: 'provenance.marker.v1.MsgBurnRequest',
  MsgCancelRequest: 'provenance.marker.v1.MsgCancelRequest',
  MsgDeleteAccessRequest: 'provenance.marker.v1.MsgDeleteAccessRequest',
  MsgDeleteRequest: 'provenance.marker.v1.MsgDeleteRequest',
  MsgFinalizeRequest: 'provenance.marker.v1.MsgFinalizeRequest',
  MsgMintRequest: 'provenance.marker.v1.MsgMintRequest',
  MsgSetDenomMetadataRequest: 'provenance.marker.v1.MsgSetDenomMetadataRequest',
  MsgTransferRequest: 'provenance.marker.v1.MsgTransferRequest',
  MsgWithdrawRequest: 'provenance.marker.v1.MsgWithdrawRequest',
  MsgAddContractSpecToScopeSpecRequest: 'provenance.metadata.v1.MsgAddContractSpecToScopeSpecRequest',
  MsgAddScopeDataAccessRequest: 'provenance.metadata.v1.MsgAddScopeDataAccessRequest',
  MsgAddScopeOwnerRequest: 'provenance.metadata.v1.MsgAddScopeOwnerRequest',
  MsgBindOSLocatorRequest: 'provenance.metadata.v1.MsgBindOSLocatorRequest',
  MsgDeleteContractSpecFromScopeSpecRequest: 'provenance.metadata.v1.MsgDeleteContractSpecFromScopeSpecRequest',
  MsgDeleteContractSpecificationRequest: 'provenance.metadata.v1.MsgDeleteContractSpecificationRequest',
  MsgDeleteOSLocatorRequest: 'provenance.metadata.v1.MsgDeleteOSLocatorRequest',
  MsgDeleteRecordRequest: 'provenance.metadata.v1.MsgDeleteRecordRequest',
  MsgDeleteRecordSpecificationRequest: 'provenance.metadata.v1.MsgDeleteRecordSpecificationRequest',
  MsgDeleteScopeDataAccessRequest: 'provenance.metadata.v1.MsgDeleteScopeDataAccessRequest',
  MsgDeleteScopeOwnerRequest: 'provenance.metadata.v1.MsgDeleteScopeOwnerRequest',
  MsgDeleteScopeRequest: 'provenance.metadata.v1.MsgDeleteScopeRequest',
  MsgDeleteScopeSpecificationRequest: 'provenance.metadata.v1.MsgDeleteScopeSpecificationRequest',
  MsgModifyOSLocatorRequest: 'provenance.metadata.v1.MsgModifyOSLocatorRequest',
  MsgP8eMemorializeContractRequest: 'provenance.metadata.v1.MsgP8eMemorializeContractRequest',
  MsgWriteContractSpecificationRequest: 'provenance.metadata.v1.MsgWriteContractSpecificationRequest',
  MsgWriteP8eContractSpecRequest: 'provenance.metadata.v1.MsgWriteP8eContractSpecRequest',
  MsgWriteRecordRequest: 'provenance.metadata.v1.MsgWriteRecordRequest',
  MsgWriteRecordSpecificationRequest: 'provenance.metadata.v1.MsgWriteRecordSpecificationRequest',
  MsgWriteScopeRequest: 'provenance.metadata.v1.MsgWriteScopeRequest',
  MsgWriteScopeSpecificationRequest: 'provenance.metadata.v1.MsgWriteScopeSpecificationRequest',
  MsgWriteSessionRequest: 'provenance.metadata.v1.MsgWriteSessionRequest',
  MsgBindNameRequest: 'provenance.name.v1.MsgBindNameRequest',
  MsgDeleteNameRequest: 'provenance.name.v1.MsgDeleteNameRequest',
  Evidence: 'tendermint.abci.Evidence',
};

const MESSAGE_PROTOS: { [key in SupportedMessageTypeNames]: typeof Message } = {
  'cosmos.authz.v1beta1.MsgGrant': MsgGrant,
  'cosmos.bank.v1beta1.MsgSend': MsgSend,
  'cosmos.crisis.v1beta1.MsgVerifyInvariant': MsgVerifyInvariant,
  'cosmos.crypto.secp256k1.PubKey': PubKey,
  'cosmos.distribution.v1beta1.MsgFundCommunityPool': MsgFundCommunityPool,
  'cosmos.distribution.v1beta1.MsgSetWithdrawAddress': MsgSetWithdrawAddress,
  'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': MsgWithdrawDelegatorReward,
  'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': MsgWithdrawValidatorCommission,
  'cosmos.evidence.v1beta1.MsgSubmitEvidence': MsgSubmitEvidence,
  'cosmos.gov.v1beta1.MsgDeposit': MsgDeposit,
  'cosmos.gov.v1beta1.MsgSubmitProposal': MsgSubmitProposal,
  'cosmos.gov.v1beta1.MsgVote': MsgVote,
  'cosmos.gov.v1beta1.Proposal': Proposal,
  'cosmos.slashing.v1beta1.MsgUnjail': MsgUnjail,
  'cosmos.staking.v1beta1.MsgBeginRedelegate': MsgBeginRedelegate,
  'cosmos.staking.v1beta1.MsgCreateValidator': MsgCreateValidator,
  'cosmos.staking.v1beta1.MsgDelegate': MsgDelegate,
  'cosmos.staking.v1beta1.MsgEditValidator': MsgEditValidator,
  'cosmos.staking.v1beta1.MsgUndelegate': MsgUndelegate,
  'cosmos.vesting.v1beta1.MsgCreateVestingAccount': MsgCreateVestingAccount,
  'cosmwasm.wasm.v1.MsgExecuteContract': MsgExecuteContract,
  'provenance.attribute.v1.MsgAddAttributeRequest': MsgAddAttributeRequest,
  'provenance.attribute.v1.MsgDeleteAttributeRequest': MsgDeleteAttributeRequest,
  'provenance.attribute.v1.MsgDeleteDistinctAttributeRequest': MsgDeleteDistinctAttributeRequest,
  'provenance.attribute.v1.MsgUpdateAttributeRequest': MsgUpdateAttributeRequest,
  'provenance.marker.v1.authz.MarkerTransferAuthorization': MarkerTransferAuthorization,
  'provenance.marker.v1.MsgActivateRequest': MsgActivateRequest,
  'provenance.marker.v1.MsgAddAccessRequest': MsgAddAccessRequest,
  'provenance.marker.v1.MsgAddMarkerRequest': MsgAddMarkerRequest,
  'provenance.marker.v1.MsgBurnRequest': MsgBurnRequest,
  'provenance.marker.v1.MsgCancelRequest': MsgCancelRequest,
  'provenance.marker.v1.MsgDeleteAccessRequest': MsgDeleteAccessRequest,
  'provenance.marker.v1.MsgDeleteRequest': MsgDeleteRequest,
  'provenance.marker.v1.MsgFinalizeRequest': MsgFinalizeRequest,
  'provenance.marker.v1.MsgMintRequest': MsgMintRequest,
  'provenance.marker.v1.MsgSetDenomMetadataRequest': MsgSetDenomMetadataRequest,
  'provenance.marker.v1.MsgTransferRequest': MsgTransferRequest,
  'provenance.marker.v1.MsgWithdrawRequest': MsgWithdrawRequest,
  'provenance.metadata.v1.MsgAddContractSpecToScopeSpecRequest': MsgAddContractSpecToScopeSpecRequest,
  'provenance.metadata.v1.MsgAddScopeDataAccessRequest': MsgAddScopeDataAccessRequest,
  'provenance.metadata.v1.MsgAddScopeOwnerRequest': MsgAddScopeOwnerRequest,
  'provenance.metadata.v1.MsgBindOSLocatorRequest': MsgBindOSLocatorRequest,
  'provenance.metadata.v1.MsgDeleteContractSpecFromScopeSpecRequest': MsgDeleteContractSpecFromScopeSpecRequest,
  'provenance.metadata.v1.MsgDeleteContractSpecificationRequest': MsgDeleteContractSpecificationRequest,
  'provenance.metadata.v1.MsgDeleteOSLocatorRequest': MsgDeleteOSLocatorRequest,
  'provenance.metadata.v1.MsgDeleteRecordRequest': MsgDeleteRecordRequest,
  'provenance.metadata.v1.MsgDeleteRecordSpecificationRequest': MsgDeleteRecordSpecificationRequest,
  'provenance.metadata.v1.MsgDeleteScopeDataAccessRequest': MsgDeleteScopeDataAccessRequest,
  'provenance.metadata.v1.MsgDeleteScopeOwnerRequest': MsgDeleteScopeOwnerRequest,
  'provenance.metadata.v1.MsgDeleteScopeRequest': MsgDeleteScopeRequest,
  'provenance.metadata.v1.MsgDeleteScopeSpecificationRequest': MsgDeleteScopeSpecificationRequest,
  'provenance.metadata.v1.MsgModifyOSLocatorRequest': MsgModifyOSLocatorRequest,
  'provenance.metadata.v1.MsgP8eMemorializeContractRequest': MsgP8eMemorializeContractRequest,
  'provenance.metadata.v1.MsgWriteContractSpecificationRequest': MsgWriteContractSpecificationRequest,
  'provenance.metadata.v1.MsgWriteP8eContractSpecRequest': MsgWriteP8eContractSpecRequest,
  'provenance.metadata.v1.MsgWriteRecordRequest': MsgWriteRecordRequest,
  'provenance.metadata.v1.MsgWriteRecordSpecificationRequest': MsgWriteRecordSpecificationRequest,
  'provenance.metadata.v1.MsgWriteScopeRequest': MsgWriteScopeRequest,
  'provenance.metadata.v1.MsgWriteScopeSpecificationRequest': MsgWriteScopeSpecificationRequest,
  'provenance.metadata.v1.MsgWriteSessionRequest': MsgWriteSessionRequest,
  'provenance.name.v1.MsgBindNameRequest': MsgBindNameRequest,
  'provenance.name.v1.MsgDeleteNameRequest': MsgDeleteNameRequest,
  'tendermint.abci.Evidence': Evidence,
};

type UnknownContract = {
  msg: any;
};

export type MsgExecuteContractParams =
  | (Omit<MsgExecuteContract.AsObject, 'msg'> & UnknownContract)
  | (Omit<MsgExecuteContract.AsObject, 'msg'> & AtsMessage)
  | (Omit<MsgExecuteContract.AsObject, 'msg'> & { msg: DigitalCurrencyConsortiumExecuteMsg });

export type MsgExecuteContractDisplay = {
  sender: string;
  msg: any;
  fundsList: CoinAsObject[];
};

export type MsgSubmitEvidenceDisplay = Omit<MsgSubmitEvidence.AsObject, 'evidence'> & {
  evidence: Evidence.AsObject;
};

// export type MsgSubmitProposalDisplay = Omit<MsgSubmitProposal.AsObject, 'content'> & {
//   content: Proposal.AsObject;
// };

export type MsgCreateValidatorDisplay = Omit<MsgCreateValidator.AsObject, 'pubkey'> & {
  pubkey: PubKey.AsObject;
};

export type GenericDisplay = { [key: string]: any };

export class MessageService {
  encoder = new TextEncoder();
  decoder = new TextDecoder('utf-8');

  msgAnyB64toAny(msgAnyB64: string): google_protobuf_any_pb.Any {
    return google_protobuf_any_pb.Any.deserializeBinary(base64ToBytes(msgAnyB64));
  }

  buildMessage(
    type: ReadableMessageNames,
    params:
      | MsgSendDisplay
      | MsgExecuteContractParams
      | MsgGrantDisplay
      | MsgVerifyInvariantDisplay
      | MsgSetWithdrawAddressDisplay
      | MsgWithdrawDelegatorRewardDisplay
      | MsgWithdrawValidatorCommissionDisplay
      | MsgFundCommunityPoolDisplay
      | MsgSubmitEvidenceDisplay
      | MsgVoteDisplay
      | MsgDepositDisplay
      | MsgUnjailDisplay
      | MsgCreateValidatorDisplay
      | MsgEditValidatorDisplay
      | MsgDelegateDisplay
      | MsgBeginRedelegateDisplay
      | MsgUndelegateDisplay
      | MsgCreateVestingAccountDisplay
  ): Message {
    switch (type) {
      case 'MsgSend': {
        const { fromAddress, toAddress, amountList } = params as MsgSendDisplay;
        log(`Building MsgSend: ${fromAddress} to ${toAddress}`);
        const msgSend = new MsgSend().setFromAddress(fromAddress).setToAddress(toAddress);
        amountList.forEach(({ denom, amount }) => {
          msgSend.addAmount(new Coin().setAmount(`${amount}`).setDenom(denom));
        });
        return msgSend;
      }
      case 'MsgGrant': {
        const {
          granter,
          grantee,
          transferLimit: { amount, denom },
        } = params as MsgGrantDisplay;
        log(`Building MsgGrant: ${granter} to ${grantee}`);
        const authorization = new MarkerTransferAuthorization();
        authorization.addTransferLimit(new Coin().setAmount(`${amount}`).setDenom(denom));
        const authorizationAny = new google_protobuf_any_pb.Any();
        authorizationAny.pack(authorization.serializeBinary(), TYPE_NAMES_READABLE_MAP.MarkerTransferAuthorization, '/');
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const timestamp = new Timestamp();
        timestamp.fromDate(date);
        return new MsgGrant()
          .setGranter(granter)
          .setGrantee(grantee)
          .setGrant(new Grant().setExpiration(timestamp).setAuthorization(authorizationAny));
      }
      case 'MsgExecuteContract': {
        const { sender, contract, msg, fundsList } = params as MsgExecuteContractParams;
        log(`Building MsgExecuteContract: Sender: ${sender} Contract: ${contract}`);
        const msgExecuteContract = new MsgExecuteContract()
          .setContract(contract)
          .setSender(sender)
          .setMsg(this.encoder.encode(JSON.stringify(msg)));
        if (fundsList)
          fundsList.forEach(({ denom, amount }) => {
            msgExecuteContract.addFunds(new Coin().setAmount(`${amount}`).setDenom(denom));
          });
        return msgExecuteContract;
      }
      case 'MsgVerifyInvariant': {
        const { sender, invariantRoute, invariantModuleName } = params as MsgVerifyInvariantDisplay;
        return new MsgVerifyInvariant()
          .setSender(sender)
          .setInvariantRoute(invariantRoute)
          .setInvariantModuleName(invariantModuleName);
      }
      case 'MsgSetWithdrawAddress': {
        const { delegatorAddress, withdrawAddress } = params as MsgSetWithdrawAddressDisplay;
        return new MsgSetWithdrawAddress().setWithdrawAddress(withdrawAddress).setDelegatorAddress(delegatorAddress);
      }
      case 'MsgWithdrawDelegatorReward': {
        const { delegatorAddress, validatorAddress } = params as MsgWithdrawDelegatorRewardDisplay;
        return new MsgWithdrawDelegatorReward().setValidatorAddress(validatorAddress).setDelegatorAddress(delegatorAddress);
      }
      case 'MsgWithdrawValidatorCommission': {
        const { validatorAddress } = params as MsgWithdrawValidatorCommissionDisplay;
        return new MsgWithdrawValidatorCommission().setValidatorAddress(validatorAddress);
      }
      case 'MsgFundCommunityPool': {
        const { amountList, depositor } = params as MsgFundCommunityPoolDisplay;
        const msgFundCommunityPool = new MsgFundCommunityPool().setDepositor(depositor);
        amountList.forEach(({ denom, amount }) => {
          msgFundCommunityPool.addAmount(new Coin().setAmount(`${amount}`).setDenom(denom));
        });
        return msgFundCommunityPool;
      }
      case 'MsgSubmitEvidence': {
        const { submitter, evidence } = params as MsgSubmitEvidenceDisplay;
        const msgSubmitEvidence = new MsgSubmitEvidence().setSubmitter(submitter);
        if (evidence) {
          const { type, time, totalVotingPower, height, validator } = evidence;
          const theEvidence = new Evidence().setHeight(height).setTotalVotingPower(totalVotingPower).setType(type);
          if (validator) {
            theEvidence.setValidator(new Validator().setAddress(validator.address).setPower(validator.power));
          }
          if (time) {
            theEvidence.setTime(new Timestamp().setSeconds(time.seconds).setNanos(time.nanos));
          }
          const evidenceAny = new google_protobuf_any_pb.Any();
          evidenceAny.pack(theEvidence.serializeBinary(), TYPE_NAMES_READABLE_MAP.Evidence, '/');
          msgSubmitEvidence.setEvidence(evidenceAny);
        }
        return msgSubmitEvidence;
      }
      case 'MsgVote': {
        const { proposalId, voter, option } = params as MsgVoteDisplay;
        return new MsgVote().setProposalId(proposalId).setVoter(voter).setOption(option);
      }
      case 'MsgDeposit': {
        const { proposalId, depositor, amountList } = params as MsgDepositDisplay;
        const msgDeposit = new MsgDeposit().setDepositor(depositor).setProposalId(proposalId);
        amountList.forEach(({ denom, amount }) => {
          msgDeposit.addAmount(new Coin().setAmount(`${amount}`).setDenom(denom));
        });
        return msgDeposit;
      }
      case 'MsgUnjail': {
        const { validatorAddr } = params as MsgUnjailDisplay;
        return new MsgUnjail().setValidatorAddr(validatorAddr);
      }
      case 'MsgCreateValidator': {
        const { pubkey, value, validatorAddress, delegatorAddress, commission, minSelfDelegation, description } =
          params as MsgCreateValidatorDisplay;
        const msgCreateValidator = new MsgCreateValidator()
          .setValidatorAddress(validatorAddress)
          .setDelegatorAddress(delegatorAddress)
          .setMinSelfDelegation(minSelfDelegation);
        if (description) {
          const { moniker, identity, website, securityContact, details } = description;
          msgCreateValidator.setDescription(
            new Description()
              .setMoniker(moniker)
              .setIdentity(identity)
              .setWebsite(website)
              .setSecurityContact(securityContact)
              .setDetails(details)
          );
        }
        if (value) {
          msgCreateValidator.setValue(new Coin().setAmount(value.amount).setDenom(value.denom));
        }
        if (commission) {
          msgCreateValidator.setCommission(
            new CommissionRates().setRate(commission.rate).setMaxChangeRate(commission.maxChangeRate).setMaxRate(commission.maxRate)
          );
        }
        if (pubkey) {
          const key = new PubKey().setKey(pubkey.key);
          const pubKeyAny = new google_protobuf_any_pb.Any();
          pubKeyAny.pack(key.serializeBinary(), TYPE_NAMES_READABLE_MAP.PubKey, '/');
          msgCreateValidator.setPubkey(pubKeyAny);
        }
        return msgCreateValidator;
      }
      case 'MsgEditValidator': {
        const { description, validatorAddress, commissionRate, minSelfDelegation } = params as MsgEditValidatorDisplay;
        const msgEditValidator = new MsgEditValidator()
          .setValidatorAddress(validatorAddress)
          .setCommissionRate(commissionRate)
          .setMinSelfDelegation(minSelfDelegation);
        if (description) {
          const { moniker, identity, website, securityContact, details } = description;
          msgEditValidator.setDescription(
            new Description()
              .setMoniker(moniker)
              .setIdentity(identity)
              .setWebsite(website)
              .setSecurityContact(securityContact)
              .setDetails(details)
          );
        }
        return msgEditValidator;
      }
      case 'MsgDelegate': {
        const { delegatorAddress, validatorAddress, amount } = params as MsgDelegateDisplay;
        const msgDelegate = new MsgDelegate().setDelegatorAddress(delegatorAddress).setValidatorAddress(validatorAddress);
        if (amount) {
          msgDelegate.setAmount(new Coin().setAmount(`${amount.amount}`).setDenom(amount.denom));
        }
        return msgDelegate;
      }
      case 'MsgBeginRedelegate': {
        const { delegatorAddress, validatorDstAddress, validatorSrcAddress, amount } = params as MsgBeginRedelegateDisplay;
        const msgBeginRedelegate = new MsgBeginRedelegate()
          .setDelegatorAddress(delegatorAddress)
          .setValidatorDstAddress(validatorDstAddress)
          .setValidatorSrcAddress(validatorSrcAddress);
        if (amount) {
          msgBeginRedelegate.setAmount(new Coin().setAmount(`${amount.amount}`).setDenom(amount.denom));
        }
        return msgBeginRedelegate;
      }
      case 'MsgUndelegate': {
        const { delegatorAddress, validatorAddress, amount } = params as MsgUndelegateDisplay;
        const msgUndelegate = new MsgUndelegate().setDelegatorAddress(delegatorAddress).setValidatorAddress(validatorAddress);
        if (amount) {
          msgUndelegate.setAmount(new Coin().setAmount(`${amount.amount}`).setDenom(amount.denom));
        }
        return msgUndelegate;
      }
      case 'MsgCreateVestingAccount': {
        const { fromAddress, toAddress, endTime, delayed, amountList } = params as MsgCreateVestingAccountDisplay;
        const msgCreateVestingAccount = new MsgCreateVestingAccount()
          .setFromAddress(fromAddress)
          .setToAddress(toAddress)
          .setEndTime(endTime)
          .setDelayed(delayed);
        amountList.forEach(({ denom, amount }) => {
          msgCreateVestingAccount.addAmount(new Coin().setAmount(`${amount}`).setDenom(denom));
        });
        return msgCreateVestingAccount;
      }
      default:
        throw new Error(`Message type: ${type} is not supported for build.`);
    }
  }

  createAnyMessageBase64(type: ReadableMessageNames, msg: Message): string {
    log(`Creating Any message`);
    const msgAny = new google_protobuf_any_pb.Any();
    msgAny.pack(msg.serializeBinary(), TYPE_NAMES_READABLE_MAP[type], '/');
    return bytesToBase64(msgAny.serializeBinary());
  }

  unpackDisplayObjectFromWalletMessage(anyMsgBase64: string): (MsgSendDisplay | MsgExecuteContractDisplay | GenericDisplay) & {
    typeName: ReadableMessageNames | FallbackGenericMessageName;
  } {
    const msgBytes = base64ToBytes(anyMsgBase64);
    const msgAny = google_protobuf_any_pb.Any.deserializeBinary(msgBytes);
    const typeName = msgAny.getTypeName() as SupportedMessageTypeNames;
    if (MESSAGE_PROTOS[typeName]) {
      const message = msgAny.unpack(MESSAGE_PROTOS[typeName].deserializeBinary, typeName);
      switch (typeName) {
        case 'cosmos.bank.v1beta1.MsgSend':
          return {
            typeName: 'MsgSend',
            ...(message as MsgSend).toObject(),
          };
        case 'cosmwasm.wasm.v1.MsgExecuteContract':
          return {
            typeName: 'MsgExecuteContractGeneric',
            sender: (message as MsgExecuteContract).getSender(),
            msg: JSON.parse(this.decoder.decode((message as MsgExecuteContract).getMsg() as Uint8Array)),
            fundsList: (message as MsgExecuteContract).getFundsList().map((coin) => ({
              denom: coin.getDenom(),
              amount: Number(coin.getAmount()),
            })),
          };
        default:
          return {
            typeName: 'MsgGeneric',
            ...(message as Message).toObject(),
          };
      }
    }
    throw new Error(`Message type: ${typeName} is not supported for display.`);
  }

  buildSimulateRequest(
    msgAny: google_protobuf_any_pb.Any | google_protobuf_any_pb.Any[],
    account: BaseAccount,
    chainId: string,
    wallet: Wallet,
    memo = '',
    feeDenom: SupportedDenoms = 'nhash'
  ): SimulateRequest {
    log(`Building simulated request.`);
    const signerInfo = this.buildSignerInfo(account, wallet.publicKey);
    const authInfo = this.buildAuthInfo(signerInfo, feeDenom);
    const txBody = this.buildTxBody(msgAny, memo);
    const txRaw = new TxRaw();
    txRaw.setBodyBytes(txBody.serializeBinary());
    txRaw.setAuthInfoBytes(authInfo.serializeBinary());
    const signDoc = this.buildSignDoc(account.getAccountNumber(), chainId, txRaw);
    const signature = this.signBytes(signDoc.serializeBinary(), wallet.privateKey);
    txRaw.setSignaturesList([signature]);
    // const tx = new Tx();
    // tx.setBody(txBody);
    // tx.setAuthInfo(authInfo);
    // tx.setSignaturesList([signature, signature]);
    const simulateRequest = new SimulateRequest();
    simulateRequest.setTxBytes(txRaw.serializeBinary());
    return simulateRequest;
  }

  buildBroadcastTxRequest(
    msgAny: google_protobuf_any_pb.Any | google_protobuf_any_pb.Any[],
    account: BaseAccount,
    chainId: string,
    wallet: Wallet,
    feeEstimate: number,
    memo = '',
    feeDenom: SupportedDenoms = 'nhash'
  ): BroadcastTxRequest {
    log(`Building tx request for broadcast`);
    const signerInfo = this.buildSignerInfo(account, wallet.publicKey);
    const authInfo = this.buildAuthInfo(signerInfo, feeDenom, feeEstimate);
    const txBody = this.buildTxBody(msgAny, memo);
    const txRaw = new TxRaw();
    txRaw.setBodyBytes(txBody.serializeBinary());
    txRaw.setAuthInfoBytes(authInfo.serializeBinary());
    const signDoc = this.buildSignDoc(account.getAccountNumber(), chainId, txRaw);
    const signature = this.signBytes(signDoc.serializeBinary(), wallet.privateKey);
    // const verified = chainService.verifyTx(signDocBinary, bytesToBase64(wallet.publicKey), signature);
    txRaw.setSignaturesList([signature]);
    const txRequest = new BroadcastTxRequest();
    txRequest.setTxBytes(txRaw.serializeBinary());
    txRequest.setMode(BroadcastMode.BROADCAST_MODE_SYNC);
    return txRequest;
  }

  buildSignerInfo(baseAccount: BaseAccount, pubKeyBytes: Bytes): SignerInfo {
    log('Building SignerInfo');
    const single = new ModeInfo.Single();
    single.setMode(SignMode.SIGN_MODE_DIRECT);
    const modeInfo = new ModeInfo();
    modeInfo.setSingle(single);
    const signerInfo = new SignerInfo();
    const pubKey = new PubKey();
    pubKey.setKey(pubKeyBytes);
    const pubKeyAny = new google_protobuf_any_pb.Any();
    log(`PubKey displayName: ${(PubKey as any).displayName}`);
    pubKeyAny.pack(pubKey.serializeBinary(), TYPE_NAMES_READABLE_MAP.PubKey, '/');
    signerInfo.setPublicKey(pubKeyAny);
    signerInfo.setModeInfo(modeInfo);
    signerInfo.setSequence(baseAccount.getSequence());
    return signerInfo;
  }

  buildAuthInfo(signerInfo: SignerInfo, feeDenom: SupportedDenoms, feeAmount = 0, feeAdjustment = 1.25, gasPrice = 1905.0): AuthInfo {
    log('Building AuthInfo');
    const feeCoin = new Coin();
    feeCoin.setDenom(feeDenom);
    feeCoin.setAmount(`${Math.ceil(feeAmount * feeAdjustment * gasPrice)}`);
    const fee = new Fee();
    fee.setAmountList([feeCoin]);
    const feeLimit = Math.floor(feeAmount * feeAdjustment);
    fee.setGasLimit(feeLimit);
    log(`feeLimit string: ${feeLimit.toString()} - number: ${feeLimit.valueOf()}`);
    const authInfo = new AuthInfo();
    authInfo.setFee(fee);
    authInfo.setSignerInfosList([signerInfo]);
    log(`feeAmount string: ${feeAmount.toString()} - number: ${feeAmount}`);
    return authInfo;
  }

  buildTxBody(msgAny: google_protobuf_any_pb.Any | google_protobuf_any_pb.Any[], memo: string): TxBody {
    log('Build TxBody');
    const txBody = new TxBody();
    if (Array.isArray(msgAny)) txBody.setMessagesList(msgAny);
    else txBody.addMessages(msgAny);
    txBody.setMemo(memo);
    // txBody.setTimeoutHeight();
    return txBody;
  }

  buildSignDoc(accNumber: number, chainId: string, txRaw: TxRaw): SignDoc {
    const signDoc = new SignDoc();
    signDoc.setAccountNumber(accNumber);
    signDoc.setAuthInfoBytes(txRaw.getAuthInfoBytes());
    signDoc.setChainId(chainId);
    signDoc.setBodyBytes(txRaw.getBodyBytes());
    return signDoc;
  }

  signBytes(bytes: Uint8Array, privateKey: Bytes): Uint8Array {
    const hash = this.sha256(bytes);
    const { signature } = secp256k1EcdsaSign(hash, privateKey);

    return signature;
  }

  sha256(bytes: Bytes): Bytes {
    const buffer1 = bytes instanceof Buffer ? bytes : Buffer.from(bytes);
    const buffer2 = createHash('sha256').update(buffer1).digest();

    return bufferToBytes(buffer2);
  }
}
