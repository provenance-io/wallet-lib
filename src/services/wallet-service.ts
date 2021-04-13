import type { BroadcastTx, SignMeta } from '@tendermint/sig';

export type WalletState = {
  keychainAccountName: string;
  address: string;
  meta: Partial<SignMeta>;
  walletOpen: boolean;
  transaction: BroadcastTx | undefined;
};

export enum ReturnMessage {
  NONE = '',
  DENIED = 'transaction_denied',
  COMPLETE = 'transaction_complete',
  CONNECTED = 'account_connected',
  CLOSED = 'closed',
}

export type ReturnMessageObject = {
  message: ReturnMessage;
  keychainAccountName?: string;
  address?: string;
  transaction?: BroadcastTx;
};

export const WALLET_QUERY_PARAMS = {
  msgAnyB64: 'msgAnyB64',
  account: 'account',
};

type MessageObject = MessageEvent<ReturnMessageObject>;

type SetWalletState = (state: WalletState) => void;

export class WalletService {
  private setWalletState: SetWalletState | undefined = undefined;
  private walletWindow: Window | null = null;
  private eventListeners: { [key: string]: (state: WalletState) => void } = {};
  private walletUrl: string | undefined;
  state: WalletState = {
    keychainAccountName: '',
    address: '',
    meta: {},
    walletOpen: false,
    transaction: undefined,
  };
  constructor(walletUrl?: string) {
    if (walletUrl) this.walletUrl = walletUrl;
    window.addEventListener(
      'message',
      async (e: MessageObject) => {
        if (e.origin !== process.env.PROVENANCE_WALLET_URL) return;
        if (e.data.message) {
          const { message, keychainAccountName, address } = e.data;
          switch (message) {
            case ReturnMessage.CONNECTED:
              this.state.keychainAccountName = keychainAccountName || '';
              this.state.address = address || '';
              break;
            case ReturnMessage.CLOSED:
              break;
            default:
          }
          this.state.walletOpen = false;
          this.walletWindow?.close();
          this.walletWindow = null;
          if (this.eventListeners[message]) this.eventListeners[message](this.state);
          this.updateState();
        }
      },
      false
    );
  }

  setWalletUrl(url: string) {
    this.walletUrl = url;
  }

  addEventListener(event: ReturnMessage, cb: (state: WalletState) => void) {
    this.eventListeners[event] = cb;
  }

  updateState(): void {
    if (this.setWalletState)
      this.setWalletState({
        ...this.state,
      });
  }

  setStateUpdater(setWalletState: SetWalletState): void {
    this.setWalletState = setWalletState;
  }

  openWallet(isTransaction = false, msgAnyB64?: string): void {
    if (!this.walletUrl) throw new Error(`WalletService requires walletUrl to access browser wallet`);
    this.walletWindow?.close();
    const height = window.top.outerHeight < 750 ? window.top.outerHeight : 750;
    const width = 460;
    const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;
    this.walletWindow = window.open(
      `${process.env.PROVENANCE_WALLET_URL}/${isTransaction ? 'wallet/transaction' : 'wallet/connect'}${
        isTransaction && msgAnyB64 && this.state.keychainAccountName
          ? `?${WALLET_QUERY_PARAMS.msgAnyB64}=${encodeURIComponent(JSON.stringify(msgAnyB64))}&${WALLET_QUERY_PARAMS.account}=${
              this.state.keychainAccountName
            }`
          : ''
      }`,
      undefined,
      `resizable=1, scrollbars=1, fullscreen=0, height=${height}, width=${width}, top=${y} left=${x} toolbar=0, menubar=0, status=1`
    );
    this.state.walletOpen = true;
    this.updateState();
  }
}

export default WalletService;
