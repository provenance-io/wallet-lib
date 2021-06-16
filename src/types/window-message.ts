import { WALLET_MESSAGES, WINDOW_MESSAGES } from '../constants/window-message';

export type QueryParams = {
  msgAnyB64: string;
  keychainAccountName?: string;
  isWindow?: string;
  address?: string;
  memo?: string;
};

export type SignQueryParams = {
  payload: string | Uint8Array;
  description: string;
  origin: string;
  title?: string;
  keychainAccountName?: string;
  isWindow?: string;
  address?: string;
};

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
      message: WINDOW_MESSAGES.SIGNATURE_COMPLETE;
      signedPayload: string | Uint8Array;
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
