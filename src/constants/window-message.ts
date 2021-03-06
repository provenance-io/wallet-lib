export enum WINDOW_MESSAGES {
  REPORT_HEIGHT = 'REPORT_HEIGHT',
  CLOSE = 'CLOSE',
  CONNECTED = 'CONNECTED',
  TRANSACTION_COMPLETE = 'TRANSACTION_COMPLETE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SIGNATURE_COMPLETE = 'SIGNATURE_COMPLETE',
  READY_FOR_POST_MESSAGE = 'READY_FOR_POST_MESSAGE',
}

export enum WALLET_MESSAGES {
  PAYLOAD = 'PAYLOAD',
}

export const MULTIPLE_MESSAGE_DELIMITER = '_';
