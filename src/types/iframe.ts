import { IFRAME_MESSAGES } from '../constants/iframe';

export type IframeMessage =
  | {
      message: IFRAME_MESSAGES.CLOSE;
      redirectUrl?: string;
    }
  | {
      message: IFRAME_MESSAGES.REPORT_HEIGHT;
      height: number;
    };
