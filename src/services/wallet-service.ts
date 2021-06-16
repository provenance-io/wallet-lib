import { ConnectedMessageData, QueryParams, SignQueryParams, WindowMessage } from '../types';
import { WALLET_MESSAGES, WINDOW_MESSAGES } from '../constants';

export type WalletState = Required<ConnectedMessageData> & {
  walletOpen: boolean;
};

type MessageObject = MessageEvent<WindowMessage>;

type SetWalletState = (state: WalletState) => void;

const WALLET_KEYS: Array<keyof ConnectedMessageData> = [
  'keychainAccountName',
  'address',
  'randomB64',
  'signedB64',
  'publicKeyB64',
  'walletType',
  'txCallbackUrl',
];

const initialState: WalletState = {
  keychainAccountName: '',
  address: '',
  randomB64: '',
  signedB64: '',
  publicKeyB64: '',
  walletType: '',
  txCallbackUrl: '',
  walletOpen: false,
};

type MessageListener = (e: MessageObject) => Promise<void>;

export class WalletService {
  private setWalletState: SetWalletState | undefined = undefined;
  private walletWindow: Window | null = null;
  private eventListeners: { [key: string]: (state: WalletState & { message: WindowMessage }) => void } = {};
  private walletUrl: string | undefined;
  private messageListener: MessageListener;
  private boundMessageListener: MessageListener;
  state: WalletState = { ...initialState };
  constructor(walletUrl?: string) {
    if (walletUrl) this.walletUrl = walletUrl;
    WALLET_KEYS.forEach((key) => {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem(key)) (this.state as any)[key] = sessionStorage.getItem(key);
      }
    });
    this.messageListener = async (e: MessageObject) => {
      if (!this.walletUrl?.includes(e.origin)) return;
      if (e.data.message) {
        switch (e.data.message) {
          case WINDOW_MESSAGES.CONNECTED: {
            WALLET_KEYS.forEach((key) => {
              const val = (e.data as any)[key] || '';
              this.state[key] = val;
              sessionStorage.setItem(key, val);
            });
            break;
          }
          default:
        }
        this.state.walletOpen = false;
        this.walletWindow?.close();
        this.walletWindow = null;
        window.removeEventListener('message', this.boundMessageListener, false);
        if (this.eventListeners[e.data.message]) this.eventListeners[e.data.message]({ ...this.state, message: e.data });
        this.updateState();
      }
    };
    this.boundMessageListener = this.messageListener.bind(this);
  }

  setWalletUrl(url: string) {
    this.walletUrl = url;
  }

  addEventListener(event: WINDOW_MESSAGES, cb: (state: WalletState & { message: WindowMessage }) => void) {
    this.eventListeners[event] = cb;
  }

  removeEventListener(event: WINDOW_MESSAGES) {
    if (this.eventListeners[event]) delete this.eventListeners[event];
  }

  removeAllEventListeners() {
    this.eventListeners = {};
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
    this.state = { ...initialState };
    WALLET_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    this.openWallet(
      `/connect?${new URLSearchParams({
        isWindow: 'true',
      }).toString()}`
    );
  }

  initialize({ keychainAccountName = '', address }: { keychainAccountName?: string; address: string }): void {
    this.state = {
      ...this.state,
      address,
      keychainAccountName,
    };
    this.updateState();
  }

  disconnect() {
    this.state = { ...initialState };
    WALLET_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    window.addEventListener('message', this.boundMessageListener, false);
    this.updateState();
  }

  transaction(tx: QueryParams) {
    this.openWallet(
      `/transaction?${new URLSearchParams({
        ...tx,
        keychainAccountName: this.state.keychainAccountName,
        address: this.state.address,
        isWindow: 'true',
      }).toString()}`
    );
  }

  sign({ payload, ...tx }: Partial<SignQueryParams>) {
    this.openWallet(
      `/sign?${new URLSearchParams({
        ...tx,
        keychainAccountName: this.state.keychainAccountName,
        address: this.state.address,
        isWindow: 'true',
        origin: window.location.origin,
      }).toString()}`,
      payload
    );
  }

  openWallet(url: string, payload?: string | Uint8Array): void {
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
    window.addEventListener('message', this.boundMessageListener, false);
    if (payload) {
      setTimeout(() => {
        this.walletWindow?.postMessage(
          {
            message: WALLET_MESSAGES.PAYLOAD,
            payload,
          },
          '*'
        );
      }, 300);
    }
    this.state.walletOpen = true;
    this.updateState();
  }
}

export default WalletService;
