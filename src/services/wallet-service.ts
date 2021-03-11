import type { BroadcastTx, SignMeta } from '@tendermint/sig';

import type { IncomingTx } from '../types';
import { ApiService } from './api-service';

const MOCKS = {
  AUTH: `{"height":"6111","result":{"type":"cosmos-sdk/Account","value":{"address":"tp1h2wkmgt3qvvdlpzn66llxwazkpyu5c3pwylxhg","coins":[{"denom":"vspn","amount":"100000"}],"public_key":null,"account_number":"14","sequence":"0"}}}`,
};

const baseUrl = process.env.REACT_APP_ENV === 'staging' ? 'https://test.provenance.io' : 'http://localhost:3000';

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

type MessageObject = MessageEvent<ReturnMessageObject>;

type SetWalletState = (state: WalletState) => void;

export class WalletService {
  private setWalletState: SetWalletState | undefined = undefined;
  private walletWindow: Window | null = null;
  private apiService: ApiService;
  private eventListeners: { [key: string]: (state: WalletState) => void } = {};
  state: WalletState = {
    keychainAccountName: '',
    address: '',
    meta: {},
    walletOpen: false,
    transaction: undefined,
  };
  constructor(url = 'http://localhost:1317', chainId = 'chain-local') {
    this.state.meta.chain_id = chainId;
    this.apiService = new ApiService(url);
    window.addEventListener(
      'message',
      async (e: MessageObject) => {
        if (e.origin !== baseUrl) return;
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

  getAccount(): void {
    if (this.state.address) {
      this.apiService.get(`/auth/accounts/${this.state.address}`).finally();
    }
  }

  openWallet(isTransaction = false, tx?: IncomingTx): void {
    this.walletWindow?.close();
    const height = window.top.outerHeight < 750 ? window.top.outerHeight : 750;
    const width = 460;
    const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;
    this.walletWindow = window.open(
      `${baseUrl}/${isTransaction ? 'wallet/transaction' : 'wallet/connect'}${
        isTransaction && tx && this.state.keychainAccountName
          ? `?tx=${encodeURIComponent(JSON.stringify(tx))}&account=${this.state.keychainAccountName}`
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
