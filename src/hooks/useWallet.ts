import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    chainId,
    connect: () => connect({ connector: injected() }),
    disconnect: () => disconnect(),
  };
}
