import type { ExecuteMsg } from '../schema/ats-smart-contract/execute_msg';

export type AtsMessage = {
  contractType: 'ats';
  msg: ExecuteMsg;
};
