import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

import { WalletService, WalletState } from '../services/wallet-service';
import { MessageService, GrpcService } from '../services';

type State = {
  walletService: WalletService;
  walletState: WalletState;
  messageService: MessageService;
  grpcService: GrpcService;
};

const StateContext = createContext<State | undefined>(undefined);

const walletService = new WalletService();
const messageService = new MessageService();

const WalletContextProvider = ({
  children,
  grpcServiceAddress,
  walletUrl,
}: {
  children: React.ReactElement;
  grpcServiceAddress?: string;
  walletUrl?: string;
}) => {
  const [walletState, setWalletState] = useState<WalletState>({ ...walletService.state });
  const grpcServiceRef = useRef(grpcServiceAddress ? new GrpcService(grpcServiceAddress) : undefined);
  useEffect(() => {
    walletService.setStateUpdater(setWalletState);
    if (walletUrl) walletService.setWalletUrl(walletUrl);
    return () => walletService.removeAllEventListeners();
    // eslint-disable-next-line
  }, []);
  return (
    <StateContext.Provider value={{ walletService, walletState, messageService, grpcService: grpcServiceRef.current as GrpcService }}>
      {children}
    </StateContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
};

export { WalletContextProvider, useWallet };
