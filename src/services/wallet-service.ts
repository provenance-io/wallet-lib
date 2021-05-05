import { QueryParams, WindowMessage } from '../types';
import { WINDOW_MESSAGES } from '../constants';

export type WalletState = {
  keychainAccountName: string;
  address: string;
  randomB64: string;
  signedB64: string;
  publicKeyB64: string;
  walletOpen: boolean;
};

type MessageObject = MessageEvent<WindowMessage>;

type SetWalletState = (state: WalletState) => void;

const SESSION_STORAGE_PARAMS: Array<keyof WalletState> = ['keychainAccountName', 'address'];

export class WalletService {
  private setWalletState: SetWalletState | undefined = undefined;
  private walletWindow: Window | null = null;
  private eventListeners: { [key: string]: (state: WalletState) => void } = {};
  private walletUrl: string | undefined;
  state: WalletState = {
    keychainAccountName: '',
    address: '',
    randomB64: '',
    signedB64: '',
    publicKeyB64: '',
    walletOpen: false,
  };
  constructor(walletUrl?: string) {
    if (walletUrl) this.walletUrl = walletUrl;
    SESSION_STORAGE_PARAMS.forEach((key) => {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem(key)) (this.state as any)[key] = sessionStorage.getItem(key);
      }
    });
    window.addEventListener(
      'message',
      async (e: MessageObject) => {
        if (e.origin !== this.walletUrl) return;
        if (e.data.message) {
          switch (e.data.message) {
            case WINDOW_MESSAGES.CONNECTED: {
              const { keychainAccountName = '', address = '', randomB64 = '', signedB64 = '', publicKeyB64 = '' } = e.data;
              this.state = {
                ...this.state,
                keychainAccountName,
                address,
                randomB64,
                signedB64,
                publicKeyB64,
              };
              sessionStorage.setItem('keychainAccountName', keychainAccountName);
              sessionStorage.setItem('address', address);
              sessionStorage.setItem('randomB64', randomB64);
              sessionStorage.setItem('signedB64', signedB64);
              sessionStorage.setItem('publicKeyB64', publicKeyB64);
              break;
            }
            default:
          }
          this.state.walletOpen = false;
          this.walletWindow?.close();
          this.walletWindow = null;
          if (this.eventListeners[e.data.message]) this.eventListeners[e.data.message](this.state);
          this.updateState();
        }
      },
      false
    );
  }

  setWalletUrl(url: string) {
    this.walletUrl = url;
  }

  addEventListener(event: WINDOW_MESSAGES, cb: (state: WalletState) => void) {
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

  connect() {
    this.openWallet(
      `/connect?${new URLSearchParams({
        isWindow: 'true',
      }).toString()}`
    );
  }

  transaction(tx: QueryParams) {
    this.openWallet(
      `/transaction?${new URLSearchParams({
        ...tx,
        keychainAccountName: this.state.keychainAccountName,
        isWindow: 'true',
      }).toString()}`
    );
  }

  openWallet(url: string): void {
    if (!this.walletUrl) throw new Error(`WalletService requires walletUrl to access browser wallet`);
    this.walletWindow?.close();
    const height = window.top.outerHeight < 750 ? window.top.outerHeight : 750;
    const width = 460;
    const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;
    this.walletWindow = window.open(
      `${this.walletUrl}${url}`,
      undefined,
      `resizable=1, scrollbars=1, fullscreen=0, height=${height}, width=${width}, top=${y} left=${x} toolbar=0, menubar=0, status=1`
    );
    this.state.walletOpen = true;
    this.updateState();
  }
}

export default WalletService;
