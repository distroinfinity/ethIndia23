import { useNetwork } from "wagmi";
import { appChains } from "~~/services/web3/wagmiConnectors";

/**
 * Checks if the network is suported
 */
export const useNetworkSupported = () => {
  const { chain } = useNetwork();
  return appChains.chains.findIndex(c => c.id === chain?.id) !== -1;
};
