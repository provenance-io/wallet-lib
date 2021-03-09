import type { BroadcastTx } from '@tendermint/sig';
import type { IncomingTx } from '../types';

const baseUrl = process.env.REACT_APP_ENV === 'staging' ? 'https://test.provenance.io' : 'http://localhost:3000';

export type WalletState = {
  account: string;
  address: string;
  walletOpen: boolean;
  transaction: BroadcastTx | undefined;
};

type SetWalletState = (state: WalletState) => void;

export class WalletService {
  private setWalletState: SetWalletState | undefined = undefined;
  private walletWindow: Window | null = null;
  state: WalletState = {
    account: '',
    address: '',
    walletOpen: false,
    transaction: undefined,
  };
  constructor() {
    window.addEventListener(
      'message',
      (e) => {
        if (e.origin !== baseUrl) return;
        if (e.data?.account) this.state.account = e.data?.account;
        if (e.data?.address) this.state.address = e.data?.address;
        this.state.transaction = e.data?.transaction;
        this.state.walletOpen = false;
        this.walletWindow?.close();
        this.walletWindow = null;
        this.updateState();
      },
      false
    );
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

  openWallet(transaction = false, tx?: IncomingTx): void {
    this.walletWindow?.close();
    const height = window.top.outerHeight < 750 ? window.top.outerHeight : 750;
    const width = 460;
    const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;
    this.walletWindow = window.open(
      `${baseUrl}/${transaction ? 'wallet/transaction' : 'wallet/connect'}${
        transaction && tx && this.state.account ? `?tx=${encodeURIComponent(JSON.stringify(tx))}&account=${this.state.account}` : ''
      }`,
      undefined,
      `resizable=1, scrollbars=1, fullscreen=0, height=${height}, width=${width}, top=${y} left=${x} toolbar=0, menubar=0, status=1`
    );
    this.state.walletOpen = true;
    this.updateState();
  }
}

export default WalletService;
