import React, { createContext, useContext, useEffect, useState } from 'react';

import { WalletService, WalletState } from '../services/wallet-service';

type State = {
  walletService: WalletService;
  walletState: WalletState;
};

const StateContext = createContext<State | undefined>(undefined);

const walletService = new WalletService();

const WalletContextProvider = ({ children }: { children: React.ReactElement }) => {
  const [walletState, setWalletState] = useState<WalletState>({ ...walletService.state });
  useEffect(() => {
    walletService.setStateUpdater(setWalletState);
  }, []);
  return <StateContext.Provider value={{ walletService, walletState }}>{children}</StateContext.Provider>;
};

const useWallet = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
};

export { WalletContextProvider, useWallet };
