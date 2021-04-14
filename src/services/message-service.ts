import type { Wallet } from '@tendermint/sig';
import type { Bytes } from '@tendermint/types';
import * as google_protobuf_any_pb from 'google-protobuf/google/protobuf/any_pb';
import { AuthInfo, Fee, ModeInfo, SignDoc, SignerInfo, Tx, TxBody, TxRaw } from 'proto/cosmos/tx/v1beta1/tx_pb';
import { BroadcastMode, BroadcastTxRequest, SimulateRequest } from 'proto/cosmos/tx/v1beta1/service_pb';
import { MsgSend } from 'proto/cosmos/bank/v1beta1/tx_pb';
import { Coin } from 'proto/cosmos/base/v1beta1/coin_pb';
import { SignMode } from 'proto/cosmos/tx/signing/v1beta1/signing_pb';
import { BaseAccount } from 'proto/cosmos/auth/v1beta1/auth_pb';
import { PubKey } from 'proto/cosmos/crypto/secp256k1/keys_pb';
import { Message } from 'google-protobuf';
import { ecdsaSign as secp256k1EcdsaSign } from 'secp256k1';
import { createHash } from 'crypto';
import { base64ToBytes, bufferToBytes, bytesToBase64 } from '@tendermint/belt';
import { log } from '../utils';
import { CoinAsObject, SupportedDenoms } from '../types';

type SupportedMessageTypeNames = 'cosmos.bank.v1beta1.MsgSend';

export type ReadableMessageNames = 'MsgSend';

const TYPE_NAMES_READABLE_MAP: { [key in ReadableMessageNames]: SupportedMessageTypeNames } = {
  MsgSend: 'cosmos.bank.v1beta1.MsgSend',
};

const MESSAGE_PROTOS: { [key in SupportedMessageTypeNames]: typeof Message } = {
  'cosmos.bank.v1beta1.MsgSend': MsgSend,
};

export type MsgSendParams = {
  from: string;
  to: string;
  denom: SupportedDenoms;
  amount: string | number;
};

export type MsgSendDisplay = {
  from: string;
  to: string;
  amountList: CoinAsObject[];
};

export class MessageService {
  msgAnyB64toAny(msgAnyB64: string): google_protobuf_any_pb.Any {
    return google_protobuf_any_pb.Any.deserializeBinary(base64ToBytes(msgAnyB64));
  }

  buildMessage(type: ReadableMessageNames, params: MsgSendParams): Message {
    switch (type) {
      case 'MsgSend': {
        const { from, to, amount, denom } = params;
        log(`Building MsgSend: ${from} to ${to} ${amount}${denom}`);
        const txCoin = new Coin();
        txCoin.setDenom(denom);
        txCoin.setAmount(`${amount}`);
        const msgSend = new MsgSend();
        msgSend.setFromAddress(from);
        msgSend.setToAddress(to);
        msgSend.addAmount(txCoin);
        return msgSend;
      }
      default:
        throw new Error(`Message type: ${type} is not supported.`);
    }
  }

  createAnyMessageBase64(msg: Message, type: ReadableMessageNames): string {
    log(`Creating Any message`);
    const msgAny = new google_protobuf_any_pb.Any();
    msgAny.pack(msg.serializeBinary(), TYPE_NAMES_READABLE_MAP[type], '/');
    return bytesToBase64(msgAny.serializeBinary());
  }

  unpackDisplayObjectFromWalletMessage(anyMsgBase64: string): MsgSendDisplay & { typeName: ReadableMessageNames } {
    const msgBytes = base64ToBytes(anyMsgBase64);
    const msgAny = google_protobuf_any_pb.Any.deserializeBinary(msgBytes);
    const typeName = msgAny.getTypeName() as SupportedMessageTypeNames;
    if (MESSAGE_PROTOS[typeName]) {
      const message = msgAny.unpack(MESSAGE_PROTOS[typeName].deserializeBinary, typeName);
      switch (typeName) {
        case 'cosmos.bank.v1beta1.MsgSend':
          return {
            typeName: 'MsgSend',
            from: (message as MsgSend).getFromAddress(),
            to: (message as MsgSend).getToAddress(),
            amountList: (message as MsgSend).getAmountList().map((coin) => ({
              denom: coin.getDenom(),
              amount: Number(coin.getAmount()),
            })),
          };
        default:
          throw new Error(`Message type: ${typeName} is not supported.`);
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
