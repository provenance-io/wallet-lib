import { Error as ServerError } from 'grpc-web';
import { ServiceClient as TxServiceClient } from '../proto/cosmos/tx/v1beta1/service_grpc_web_pb';
import { QueryClient as AuthQueryClient } from '../proto/cosmos/auth/v1beta1/query_grpc_web_pb';
import { QueryClient as BankQueryClient } from '../proto/cosmos/bank/v1beta1/query_grpc_web_pb';
import { QueryClient as MsgFeeQueryClient } from '../proto/provenance/msgfees/v1/query_grpc_web_pb';
import { QueryAccountRequest, QueryAccountResponse } from '../proto/cosmos/auth/v1beta1/query_pb';
import { BaseAccount } from '../proto/cosmos/auth/v1beta1/auth_pb';
import { QueryAllBalancesRequest, QueryAllBalancesResponse } from '../proto/cosmos/bank/v1beta1/query_pb';
import { PageRequest } from '../proto/cosmos/base/query/v1beta1/pagination_pb';
import { CalculateTxFeesRequest, CalculateTxFeesResponse } from '../proto/provenance/msgfees/v1/query_pb';
import {
  BroadcastTxRequest,
  BroadcastTxResponse,
  SimulateRequest,
  SimulateResponse,
  GetTxRequest,
  GetTxResponse,
} from '../proto/cosmos/tx/v1beta1/service_pb';
import { log } from '../utils';

export class GrpcService {
  private txClient: TxServiceClient;
  private authQuery: AuthQueryClient;
  private bankQuery: BankQueryClient;
  private msgFeeQuery: MsgFeeQueryClient;

  constructor(serviceAddress: string) {
    if (!serviceAddress) throw new Error('GrpcService requires serviceAddress');
    this.txClient = new TxServiceClient(serviceAddress, null);
    this.authQuery = new AuthQueryClient(serviceAddress, null);
    this.bankQuery = new BankQueryClient(serviceAddress, null);
    this.msgFeeQuery = new MsgFeeQueryClient(serviceAddress, null);
  }

  getTx(txHash: string): Promise<GetTxResponse.AsObject> {
    log('Initiating txClient.getTx');
    const request = new GetTxRequest().setHash(txHash);
    return new Promise((resolve, reject) => {
      this.txClient.getTx(request, null, (error: ServerError, response: BroadcastTxResponse) => {
        if (error) reject(new Error(`txClient.getTx error: Code: ${error.code} Message: ${error.message}`));
        else {
          log(JSON.stringify(response.toObject()));
          resolve(response.toObject());
        }
      });
    });
  }

  broadcastTx(request: BroadcastTxRequest): Promise<BroadcastTxResponse.AsObject> {
    log('Initiating txClient.broadcastTx');
    return new Promise((resolve, reject) => {
      this.txClient.broadcastTx(request, null, (error: ServerError, response: BroadcastTxResponse) => {
        if (error) reject(new Error(`txClient.broadcastTx error: Code: ${error.code} Message: ${error.message}`));
        else {
          log(JSON.stringify(response.toObject()));
          resolve(response.toObject());
        }
      });
    });
  }

  calculateTxFees(request: CalculateTxFeesRequest): Promise<CalculateTxFeesResponse.AsObject> {
    log('Initiating msgFeeQuery.calculateTxFees');
    return new Promise((resolve, reject) => {
      this.msgFeeQuery.calculateTxFees(request, null, (error: ServerError, response: CalculateTxFeesResponse) => {
        if (error) {
          reject(new Error(`msgFeeQuery.calculateTxFees error: Code: ${error.code} Message: ${error.message}`));
        } else {
          log('Finished msgFeeQuery.calculateTxFees');
          log(JSON.stringify(response.toObject()));
          resolve(response.toObject());
        }
      });
    });
  }

  simulate(request: SimulateRequest): Promise<SimulateResponse.AsObject> {
    log('Initiating txClient.simulate');
    return new Promise((resolve, reject) => {
      this.txClient.simulate(request, null, (error: ServerError, response: SimulateResponse) => {
        if (error) reject(new Error(`txClient.simulate error: Code: ${error.code} Message: ${error.message}`));
        else {
          log(JSON.stringify(response.toObject()));
          resolve(response.toObject());
        }
      });
    });
  }

  getBalancesList(address: string): Promise<QueryAllBalancesResponse.AsObject> {
    log('Initiating bankQuery.allBalances');
    const pageRequest = new PageRequest();
    pageRequest.setOffset(0);
    pageRequest.setLimit(1000);
    pageRequest.setCountTotal(true);
    const bankRequest = new QueryAllBalancesRequest();
    bankRequest.setAddress(address);
    bankRequest.setPagination(pageRequest);
    return new Promise((resolve, reject) => {
      this.bankQuery.allBalances(bankRequest, null, (error: ServerError, response: QueryAllBalancesResponse) => {
        if (error) reject(new Error(`bankQuery.allBalances error: Code: ${error.code} Message: ${error.message}`));
        else {
          log(JSON.stringify(response.toObject()));
          resolve(response.toObject());
        }
      });
    });
  }

  getAccountInfo(address: string): Promise<{ baseAccount: BaseAccount; accountNumber: number; sequence: number }> {
    log('Initiating authQuery.account');
    const accountRequest = new QueryAccountRequest();
    accountRequest.setAddress(address);
    return new Promise((resolve, reject) => {
      this.authQuery.account(accountRequest, null, (error: ServerError, response: QueryAccountResponse) => {
        if (error) reject(new Error(`authQuery.account error: Code: ${error.code} Message: ${error.message}`));
        else {
          log(JSON.stringify(response.toObject()));
          const accountAny = response.getAccount();
          if (accountAny) {
            const baseAccount = accountAny.unpack(BaseAccount.deserializeBinary, accountAny.getTypeName());
            if (baseAccount) {
              resolve({
                baseAccount,
                accountNumber: baseAccount.getAccountNumber(),
                sequence: baseAccount.getSequence(),
              });
            } else reject(new Error(`authQuery.account message unpacking failure`));
          } else reject(new Error(`No response from authQuery.account`));
        }
      });
    });
  }
}
