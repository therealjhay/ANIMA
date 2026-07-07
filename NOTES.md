# SDK Issues & Notes

- **Phase 1 (Wallet Connect)**: Used a custom chain placeholder (`zeroGTestnet` with chainId 16600) as the specific 0G Testnet chain might not be published in viem/chains yet. RPC URL falls back to `https://evm-rpc.testnet.0g.ai`.

- **Phase 2 (Smart Contract)**: Contract tested and compiled locally (hardhat network). Not yet deployed to 0G testnet — awaiting `ZG_PRIVATE_KEY` and `NEXT_PUBLIC_0G_RPC_URL` env vars.
  To deploy: `cd contracts && npx hardhat run scripts/deploy.ts --network zg_testnet`
  Then set `NEXT_PUBLIC_ANIMA_REGISTRY_ADDRESS` in `.env.local`.

- **Phase 3 (Chat UI)**: Vercel AI SDK `ai@6` removed the `ai/react` sub-path export. Pinned to `ai@3` (latest v3.x) which exports `useChat` from `"ai/react"` as documented. Version used: 3.x.
