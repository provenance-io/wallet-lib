import { useEffect, useState } from 'react';
import { WalletService, WalletState } from '../services/wallet-service';

const walletService = new WalletService();

export const useWalletService = (walletUrl: string) => {
  const [walletState, setWalletState] = useState<WalletState>({ ...walletService.state });
  useEffect(() => {
    walletService.setStateUpdater(setWalletState);
    if (walletUrl) walletService.setWalletUrl(walletUrl);
    // eslint-disable-next-line
  }, []);
  return { walletState, walletService };
};
