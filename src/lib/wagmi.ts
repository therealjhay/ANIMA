import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { type Chain } from "viem";

// 0G Newton Testnet configuration
export const zeroGTestnet = {
  id: 16600,
  name: "0G Newton Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evm-rpc.testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Testnet Explorer",
      url: "https://scan-testnet.0g.ai",
    },
  },
} as const satisfies Chain;

export const chains = [zeroGTestnet] as const;

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "00000000000000000000000000000000";

const metadata = {
  name: "ANIMA",
  description: "Your AI companion's memories belong to you — cryptographically, forever.",
  url: "https://anima.0g.ai", // Placeholder URL
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
