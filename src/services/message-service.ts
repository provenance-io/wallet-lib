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
import { AuthInfo, Fee, ModeInfo, SignDoc, SignerInfo, Tx, TxBody, TxRaw } from '../proto/cosmos/tx/v1beta1/tx_pb';
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
import { MsgAddMarkerRequest, MsgFinalizeRequest, MsgActivateRequest } from '../proto/provenance/marker/v1/tx_pb';
import { MsgWriteScopeRequest, MsgWriteSessionRequest, MsgWriteRecordRequest } from '../proto/provenance/metadata/v1/tx_pb';

type SupportedMessageTypeNames =
  | 'tendermint.abci.Evidence'
  | 'cosmos.bank.v1beta1.MsgSend'
  | 'cosmos.gov.v1beta1.Proposal'
  | 'cosmwasm.wasm.v1.MsgExecuteContract'
  | 'cosmos.authz.v1beta1.MsgGrant'
  | 'provenance.marker.v1.MarkerTransferAuthorization'
  | 'provenance.marker.v1.MsgAddMarkerRequest'
  | 'provenance.marker.v1.MsgFinalizeRequest'
  | 'provenance.marker.v1.MsgActivateRequest'
  | 'provenance.metadata.v1.MsgWriteScopeRequest'
  | 'provenance.metadata.v1.MsgWriteSessionRequest'
  | 'provenance.metadata.v1.MsgWriteRecordRequest'
  | 'cosmos.crisis.v1beta1.MsgVerifyInvariant'
  | 'cosmos.distribution.v1beta1.MsgSetWithdrawAddress'
  | 'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'
  | 'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'
  | 'cosmos.distribution.v1beta1.MsgFundCommunityPool'
  | 'cosmos.evidence.v1beta1.MsgSubmitEvidence'
  | 'cosmos.gov.v1beta1.MsgSubmitProposal'
  | 'cosmos.gov.v1beta1.MsgVote'
  | 'cosmos.gov.v1beta1.MsgDeposit'
  | 'cosmos.slashing.v1beta1.MsgUnjail'
  | 'cosmos.staking.v1beta1.MsgCreateValidator'
  | 'cosmos.staking.v1beta1.MsgEditValidator'
  | 'cosmos.staking.v1beta1.MsgDelegate'
  | 'cosmos.staking.v1beta1.MsgBeginRedelegate'
  | 'cosmos.staking.v1beta1.MsgUndelegate'
  | 'cosmos.vesting.v1beta1.MsgCreateVestingAccount'
  | 'cosmos.crypto.secp256k1.PubKey';

export type ReadableMessageNames =
  | 'PubKey'
  | 'Evidence'
  | 'Proposal'
  | 'MsgSend'
  | 'MsgExecuteContract'
  | 'MsgGrant'
  | 'MarkerTransferAuthorization'
  | 'MsgAddMarkerRequest'
  | 'MsgFinalizeRequest'
  | 'MsgActivateRequest'
  | 'MsgWriteScopeRequest'
  | 'MsgWriteSessionRequest'
  | 'MsgWriteRecordRequest'
  | 'MsgVerifyInvariant'
  | 'MsgSetWithdrawAddress'
  | 'MsgWithdrawDelegatorReward'
  | 'MsgWithdrawValidatorCommission'
  | 'MsgFundCommunityPool'
  | 'MsgSubmitEvidence'
  | 'MsgVote'
  | 'MsgDeposit'
  | 'MsgUnjail'
  | 'MsgCreateValidator'
  | 'MsgEditValidator'
  | 'MsgDelegate'
  | 'MsgBeginRedelegate'
  | 'MsgUndelegate'
  | 'MsgCreateVestingAccount';

export type FallbackGenericMessageName = 'MsgGeneric' | 'MsgExecuteContractGeneric';

const TYPE_NAMES_READABLE_MAP: { [key in ReadableMessageNames]: SupportedMessageTypeNames } = {
  Evidence: 'tendermint.abci.Evidence',
  PubKey: 'cosmos.crypto.secp256k1.PubKey',
  Proposal: 'cosmos.gov.v1beta1.Proposal',
  MsgSend: 'cosmos.bank.v1beta1.MsgSend',
  MsgExecuteContract: 'cosmwasm.wasm.v1.MsgExecuteContract',
  MsgGrant: 'cosmos.authz.v1beta1.MsgGrant',
  MarkerTransferAuthorization: 'provenance.marker.v1.MarkerTransferAuthorization',
  MsgAddMarkerRequest: 'provenance.marker.v1.MsgAddMarkerRequest',
  MsgFinalizeRequest: 'provenance.marker.v1.MsgFinalizeRequest',
  MsgActivateRequest: 'provenance.marker.v1.MsgActivateRequest',
  MsgWriteRecordRequest: 'provenance.metadata.v1.MsgWriteRecordRequest',
  MsgWriteScopeRequest: 'provenance.metadata.v1.MsgWriteScopeRequest',
  MsgWriteSessionRequest: 'provenance.metadata.v1.MsgWriteSessionRequest',
  MsgVerifyInvariant: 'cosmos.crisis.v1beta1.MsgVerifyInvariant',
  MsgSetWithdrawAddress: 'cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  MsgWithdrawDelegatorReward: 'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MsgWithdrawValidatorCommission: 'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  MsgFundCommunityPool: 'cosmos.distribution.v1beta1.MsgFundCommunityPool',
  MsgSubmitEvidence: 'cosmos.evidence.v1beta1.MsgSubmitEvidence',
  MsgVote: 'cosmos.gov.v1beta1.MsgVote',
  MsgDeposit: 'cosmos.gov.v1beta1.MsgDeposit',
  MsgUnjail: 'cosmos.slashing.v1beta1.MsgUnjail',
  MsgCreateValidator: 'cosmos.staking.v1beta1.MsgCreateValidator',
  MsgEditValidator: 'cosmos.staking.v1beta1.MsgEditValidator',
  MsgDelegate: 'cosmos.staking.v1beta1.MsgDelegate',
  MsgBeginRedelegate: 'cosmos.staking.v1beta1.MsgBeginRedelegate',
  MsgUndelegate: 'cosmos.staking.v1beta1.MsgUndelegate',
  MsgCreateVestingAccount: 'cosmos.vesting.v1beta1.MsgCreateVestingAccount',
};

const MESSAGE_PROTOS: { [key in SupportedMessageTypeNames]: typeof Message } = {
  'tendermint.abci.Evidence': Evidence,
  'cosmos.crypto.secp256k1.PubKey': PubKey,
  'cosmos.gov.v1beta1.Proposal': Proposal,
  'cosmos.bank.v1beta1.MsgSend': MsgSend,
  'cosmwasm.wasm.v1.MsgExecuteContract': MsgExecuteContract,
  'cosmos.authz.v1beta1.MsgGrant': MsgGrant,
  'provenance.marker.v1.MarkerTransferAuthorization': MarkerTransferAuthorization,
  'provenance.marker.v1.MsgAddMarkerRequest': MsgAddMarkerRequest,
  'provenance.marker.v1.MsgFinalizeRequest': MsgFinalizeRequest,
  'provenance.marker.v1.MsgActivateRequest': MsgActivateRequest,
  'provenance.metadata.v1.MsgWriteSessionRequest': MsgWriteSessionRequest,
  'provenance.metadata.v1.MsgWriteScopeRequest': MsgWriteScopeRequest,
  'provenance.metadata.v1.MsgWriteRecordRequest': MsgWriteRecordRequest,
  'cosmos.crisis.v1beta1.MsgVerifyInvariant': MsgVerifyInvariant,
  'cosmos.distribution.v1beta1.MsgSetWithdrawAddress': MsgSetWithdrawAddress,
  'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': MsgWithdrawDelegatorReward,
  'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': MsgWithdrawValidatorCommission,
  'cosmos.distribution.v1beta1.MsgFundCommunityPool': MsgFundCommunityPool,
  'cosmos.evidence.v1beta1.MsgSubmitEvidence': MsgSubmitEvidence,
  'cosmos.gov.v1beta1.MsgSubmitProposal': MsgSubmitProposal,
  'cosmos.gov.v1beta1.MsgVote': MsgVote,
  'cosmos.gov.v1beta1.MsgDeposit': MsgDeposit,
  'cosmos.slashing.v1beta1.MsgUnjail': MsgUnjail,
  'cosmos.staking.v1beta1.MsgCreateValidator': MsgCreateValidator,
  'cosmos.staking.v1beta1.MsgEditValidator': MsgEditValidator,
  'cosmos.staking.v1beta1.MsgDelegate': MsgDelegate,
  'cosmos.staking.v1beta1.MsgBeginRedelegate': MsgBeginRedelegate,
  'cosmos.staking.v1beta1.MsgUndelegate': MsgUndelegate,
  'cosmos.vesting.v1beta1.MsgCreateVestingAccount': MsgCreateVestingAccount,
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
