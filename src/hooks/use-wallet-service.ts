import { useEffect, useRef, useState } from 'react';
import { WalletService, WalletState } from '../services/wallet-service';

export const useWalletService = (walletUrl: string) => {
  const walletService = useRef(new WalletService()).current;
  const [walletState, setWalletState] = useState<WalletState>({ ...walletService.state });
  useEffect(() => {
    walletService.setStateUpdater(setWalletState);
    walletService.setWalletUrl(walletUrl);
    return () => walletService.removeAllEventListeners();
    // eslint-disable-next-line
  }, []);
  return { walletState, walletService };
};
