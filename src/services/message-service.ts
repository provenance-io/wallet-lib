import type { Wallet } from '@tendermint/sig';
import type { Bytes } from '@tendermint/types';
import * as google_protobuf_any_pb from 'google-protobuf/google/protobuf/any_pb';
import { Message } from 'google-protobuf';
import { ecdsaSign as secp256k1EcdsaSign } from 'secp256k1';
import { createHash } from 'crypto';
import { base64ToBytes, bufferToBytes, bytesToBase64 } from '@tendermint/belt';

import { log } from '../utils';
import { AtsMessage, CoinAsObject, MsgSendDisplay, MsgSetWithdrawAddressDisplay, SupportedDenoms } from '../types';

import { AuthInfo, Fee, ModeInfo, SignDoc, SignerInfo, Tx, TxBody, TxRaw } from '../proto/cosmos/tx/v1beta1/tx_pb';
import { BroadcastMode, BroadcastTxRequest, SimulateRequest } from '../proto/cosmos/tx/v1beta1/service_pb';
import { MsgSend } from '../proto/cosmos/bank/v1beta1/tx_pb';
import { Coin } from '../proto/cosmos/base/v1beta1/coin_pb';
import { SignMode } from '../proto/cosmos/tx/signing/v1beta1/signing_pb';
import { BaseAccount } from '../proto/cosmos/auth/v1beta1/auth_pb';
import { PubKey } from '../proto/cosmos/crypto/secp256k1/keys_pb';
import { MsgExecuteContract } from '../proto/x/wasm/internal/types/tx_pb';
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

type SupportedMessageTypeNames =
  | 'cosmos.bank.v1beta1.MsgSend'
  | 'cosmwasm.wasm.v1beta1.MsgExecuteContract'
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
  | 'cosmos.vesting.v1beta1.MsgCreateVestingAccount';

export type ReadableMessageNames = 'MsgSend' | 'MsgExecuteContract' | 'MsgSetWithdrawAddress';

export type FallbackGenericMessageName = 'MsgGeneric' | 'MsgExecuteContractGeneric';

const TYPE_NAMES_READABLE_MAP: { [key in ReadableMessageNames]: SupportedMessageTypeNames } = {
  MsgSend: 'cosmos.bank.v1beta1.MsgSend',
  MsgExecuteContract: 'cosmwasm.wasm.v1beta1.MsgExecuteContract',
  MsgSetWithdrawAddress: 'cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
};

const MESSAGE_PROTOS: { [key in SupportedMessageTypeNames]: typeof Message } = {
  'cosmos.bank.v1beta1.MsgSend': MsgSend,
  'cosmwasm.wasm.v1beta1.MsgExecuteContract': MsgExecuteContract,
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
  | (Omit<MsgExecuteContract.AsObject, 'msg'> & AtsMessage);

export type MsgExecuteContractDisplay = {
  sender: string;
  msg: any;
  fundsList: CoinAsObject[];
};

export type GenericDisplay = { [key: string]: any };

export class MessageService {
  encoder = new TextEncoder();
  decoder = new TextDecoder('utf-8');

  msgAnyB64toAny(msgAnyB64: string): google_protobuf_any_pb.Any {
    return google_protobuf_any_pb.Any.deserializeBinary(base64ToBytes(msgAnyB64));
  }

  buildMessage(type: ReadableMessageNames, params: MsgSendDisplay | MsgExecuteContractParams | MsgSetWithdrawAddressDisplay): Message {
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
      case 'MsgSetWithdrawAddress': {
        const { delegatorAddress, withdrawAddress } = params as MsgSetWithdrawAddressDisplay;
        return new MsgSetWithdrawAddress().setWithdrawAddress(withdrawAddress).setDelegatorAddress(delegatorAddress);
      }
      default:
        throw new Error(`Message type: ${type} is not supported.`);
    }
  }

  createAnyMessageBase64(type: ReadableMessageNames, msg: Message): string {
    log(`Creating Any message`);
    const msgAny = new google_protobuf_any_pb.Any();
    msgAny.pack(msg.serializeBinary(), TYPE_NAMES_READABLE_MAP[type], '/');
    return bytesToBase64(msgAny.serializeBinary());
  }

  unpackDisplayObjectFromWalletMessage(
    anyMsgBase64: string
  ): (MsgSendDisplay | MsgExecuteContractDisplay | GenericDisplay) & {
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
        case 'cosmwasm.wasm.v1beta1.MsgExecuteContract':
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
    throw new Error(`Message type: ${typeName} is not supported.`);
  }

  buildSimulateRequest(
    msgAny: google_protobuf_any_pb.Any,
    feeDenom: SupportedDenoms,
    account: BaseAccount,
    chainId: string,
    wallet: Wallet
  ): SimulateRequest {
    log(`Building simulated request.`);
    const signerInfo = this.buildSignerInfo(account, wallet.publicKey);
    const authInfo = this.buildAuthInfo(signerInfo, 0, feeDenom);
    const txBody = this.buildTxBody(msgAny, 'simulation');
    const txRaw = new TxRaw();
    txRaw.setBodyBytes(txBody.serializeBinary());
    txRaw.setAuthInfoBytes(authInfo.serializeBinary());
    const signDoc = this.buildSignDoc(account.getAccountNumber(), chainId, txRaw);
    const signature = this.signBytes(signDoc.serializeBinary(), wallet.privateKey);
    txRaw.setSignaturesList([signature]);
    const tx = new Tx();
    tx.setBody(txBody);
    tx.setAuthInfo(authInfo);
    tx.setSignaturesList([signature]);
    const simulateRequest = new SimulateRequest();
    simulateRequest.setTx(tx);
    return simulateRequest;
  }

  buildBroadcastTxRequest(
    msgAny: google_protobuf_any_pb.Any,
    account: BaseAccount,
    chainId: string,
    wallet: Wallet,
    fee: number,
    feeDenom: SupportedDenoms,
    memo: string
  ): BroadcastTxRequest {
    log(`Building tx request for broadcast`);
    const signerInfo = this.buildSignerInfo(account, wallet.publicKey);
    const authInfo = this.buildAuthInfo(signerInfo, fee, feeDenom);
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
    pubKeyAny.pack(pubKey.serializeBinary(), 'cosmos.crypto.secp256k1.PubKey', '/');
    signerInfo.setPublicKey(pubKeyAny);
    signerInfo.setModeInfo(modeInfo);
    signerInfo.setSequence(baseAccount.getSequence());
    return signerInfo;
  }

  buildAuthInfo(signerInfo: SignerInfo, feeAmount: number, feeDenom: SupportedDenoms): AuthInfo {
    log('Building AuthInfo');
    const feeCoin = new Coin();
    feeCoin.setDenom(feeDenom);
    feeCoin.setAmount(feeAmount.toString());
    const fee = new Fee();
    fee.setAmountList([feeCoin]);
    const feeLimit = Number((feeAmount.valueOf() * 1.25).toFixed());
    fee.setGasLimit(feeLimit);
    log(`feeLimit string: ${feeLimit.toString()} - number: ${feeLimit.valueOf()}`);
    const authInfo = new AuthInfo();
    authInfo.setFee(fee);
    authInfo.setSignerInfosList([signerInfo]);
    log(`feeAmount string: ${feeAmount.toString()} - number: ${feeAmount}`);
    return authInfo;
  }

  buildTxBody(msgAny: google_protobuf_any_pb.Any, memo: string): TxBody {
    log('Build TxBody');
    const txBody = new TxBody();
    txBody.addMessages(msgAny);
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
