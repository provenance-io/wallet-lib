import { WINDOW_MESSAGES } from '../constants/window-message';

export type QueryParams = {
  msgAnyB64: string;
  keychainAccountName?: string;
  isWindow?: string;
  address?: string;
};

export type WindowMessage =
  | {
      message: WINDOW_MESSAGES.TRANSACTION_COMPLETE;
    }
  | {
      message: WINDOW_MESSAGES.TRANSACTION_FAILED;
    }
  | {
      message: WINDOW_MESSAGES.CLOSE;
      redirectUrl?: string;
    }
  | {
      message: WINDOW_MESSAGES.REPORT_HEIGHT;
      height: number;
    }
  | {
      message: WINDOW_MESSAGES.CONNECTED;
      address: string;
      keychainAccountName?: string;
      publicKeyB64?: string;
      randomB64?: string;
      signedB64?: string;
      walletType?: string;
      txCallbackUrl?: string;
    };
