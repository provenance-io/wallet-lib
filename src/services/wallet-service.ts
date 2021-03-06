import { ConnectedMessageData, MessageParams, SignQueryParams, TransactionParams, WindowMessage } from '../types';
import { MULTIPLE_MESSAGE_DELIMITER, WALLET_MESSAGES, WINDOW_MESSAGES } from '../constants';

export type WalletState = Required<ConnectedMessageData> & {
  walletOpen: boolean;
  walletWindowActive: boolean;
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
  walletWindowActive: false,
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
          case WINDOW_MESSAGES.READY_FOR_POST_MESSAGE:
            return;
          case WINDOW_MESSAGES.SIGNATURE_COMPLETE:
          case WINDOW_MESSAGES.TRANSACTION_COMPLETE:
          case WINDOW_MESSAGES.CONNECTED: {
            WALLET_KEYS.forEach((key) => {
              const val = (e.data as any)[key] || '';
              if (val) {
                this.state[key] = val;
                sessionStorage.setItem(key, val);
              }
              delete (e.data as any)[key];
            });
            break;
          }
          default:
        }
        if (this.eventListeners[e.data.message]) this.eventListeners[e.data.message]({ ...this.state, message: e.data });
        this.closeWindow();
      }
    };
    this.boundMessageListener = this.messageListener.bind(this);
  }

  private closeWindow() {
    this.state.walletOpen = false;
    this.state.walletWindowActive = false;
    this.walletWindow?.close();
    this.walletWindow = null;
    window.removeEventListener('message', this.boundMessageListener, false);
    this.updateState();
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
        origin: window.location.origin,
      }).toString()}`
    );
  }

  /**
   * Initialize the wallet with the parameters returned from {@link connect}
   *
   * @remarks
   * Make sure a {@link WalletService} instance has been created via {@link useWalletService} or the constructor.
   */
  initialize(state: ConnectedMessageData): void {
    this.state = {
      ...this.state,
      ...state,
    };
    WALLET_KEYS.forEach((key) => {
      const val = this.state[key];
      if (val) {
        sessionStorage.setItem(key, val);
      }
    });
    this.updateState();
  }

  disconnect() {
    this.state = { ...initialState };
    WALLET_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    window.removeEventListener('message', this.boundMessageListener, false);
    this.updateState();
  }

  /**
   * Initiate a transaction, submitting any message to be signed.
   * Message needs to be a base64 string.
   * Use {@link MessageService.buildMessage} to build message.
   * Use {@link MessageService.createAnyMessageBase64} to turn message in a base64 string that is ready to be consumed here.
   *
   * @remarks
   * Requires wallet to be initialized via {@link connect} or {@link initialize}
   * After signing, the signed payload can be accessed by subscribing to the {@link WINDOW_MESSAGES.TRANSACTION_COMPLETE} event via {@link addEventListener}
   * @remarks
   * Custom Gas Price and Denom can be used when passing `gasPrice` and `denom` in the object to transaction (both values are required or the default price and denom will be used)
   */
  transaction({ msgAnyB64, ...rest }: TransactionParams) {
    let msg: string;
    if (Array.isArray(msgAnyB64)) {
      msg = msgAnyB64.join(MULTIPLE_MESSAGE_DELIMITER);
    } else msg = msgAnyB64;
    this.openWallet(
      `/transaction?${new URLSearchParams({
        ...rest,
        msgAnyB64: msg,
        keychainAccountName: this.state.keychainAccountName,
        address: this.state.address,
        isWindow: 'true',
        origin: window.location.origin,
      }).toString()}`
    );
  }

  /**
   * Send a payload to the wallet to be signed
   *
   * @remarks
   * Requires wallet to be initialized via {@link connect} or {@link initialize}
   * After signing, the signed payload can be accessed by subscribing to the {@link WINDOW_MESSAGES.SIGNATURE_COMPLETE} event via {@link addEventListener}
   */
  sign({ payload, ...tx }: Omit<SignQueryParams, keyof MessageParams>) {
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

  private openWallet(url: string, payload?: string | Uint8Array): void {
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
    this.state.walletOpen = true;
    this.updateState();
    this.pollForOpenWindow();
    if (payload) {
      const { origin } = new URL(this.walletUrl);
      const listener = (e: MessageObject) => {
        if (e.origin !== origin) return;
        if (e.data.message === WINDOW_MESSAGES.READY_FOR_POST_MESSAGE) {
          this.walletWindow?.postMessage(
            {
              message: WALLET_MESSAGES.PAYLOAD,
              payload,
            },
            origin
          );
          window.removeEventListener('message', listener, false);
        }
      };
      window.addEventListener('message', listener, false);
    }
  }

  private pollForOpenWindow(): void {
    if (this.state.walletOpen) {
      if (!this.state.walletWindowActive) {
        // have to check for actual open walletWindow here because popup blocker could cause it to be null until actually opened
        if (this.walletWindow) {
          this.state.walletWindowActive = true;
        }
      }
      if (this.state.walletWindowActive) {
        if (!this.walletWindow || this.walletWindow.closed) {
          if (this.eventListeners[WINDOW_MESSAGES.CLOSE])
            this.eventListeners[WINDOW_MESSAGES.CLOSE]({
              ...this.state,
              message: {
                message: WINDOW_MESSAGES.CLOSE,
              },
            });
          this.closeWindow();
          return;
        }
      }
      setTimeout(() => this.pollForOpenWindow(), 100);
    }
  }
}

export default WalletService;
