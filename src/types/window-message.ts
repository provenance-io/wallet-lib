import { WALLET_MESSAGES, WINDOW_MESSAGES } from '../constants/window-message';

export type MessageParams = {
  origin: string;
  keychainAccountName?: string;
  isWindow?: string;
  address?: string;
};

export type AtsQueryParams = {
  atsVersion?: string;
};

export type QueryParams = {
  [key: string]: string | undefined;
  msgAnyB64: string;
  memo?: string;
  estimatedValue?: string;
} & MessageParams;

export type SignQueryParams = {
  payload: string | Uint8Array;
  description: string;
  title?: string;
  id?: string;
} & MessageParams;

export type ConnectedMessageData = {
  address: string;
  keychainAccountName?: string;
  publicKeyB64?: string;
  randomB64?: string;
  signedB64?: string;
  walletType?: string;
  txCallbackUrl?: string;
};

export type WalletMessage = {
  message: WALLET_MESSAGES.PAYLOAD;
  payload: string | Uint8Array;
};

export type WindowMessage =
  | {
      message: WINDOW_MESSAGES.TRANSACTION_COMPLETE;
      txhash: string;
    }
  | {
      message: WINDOW_MESSAGES.TRANSACTION_FAILED;
    }
  | {
      message: WINDOW_MESSAGES.READY_FOR_POST_MESSAGE;
    }
  | {
      message: WINDOW_MESSAGES.SIGNATURE_COMPLETE;
      signedPayload: string | Uint8Array;
      id?: string;
    }
  | {
      message: WINDOW_MESSAGES.CLOSE;
      redirectUrl?: string;
    }
  | {
      message: WINDOW_MESSAGES.REPORT_HEIGHT;
      height: number;
    }
  | ({
      message: WINDOW_MESSAGES.CONNECTED;
    } & ConnectedMessageData);
