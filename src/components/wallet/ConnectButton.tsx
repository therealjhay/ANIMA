"use client";

import { useWallet } from "@/hooks/useWallet";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export function ConnectButton() {
  const { address, isConnected, disconnect } = useWallet();
  const { open } = useWeb3Modal();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium border border-border px-4 py-2 rounded-lg bg-card text-card-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm font-medium text-destructive hover:underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20"
    >
      Connect Wallet
    </button>
  );
}
