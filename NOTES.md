# SDK Issues & Notes

- **Phase 1 (Wallet Connect)**: Used a custom chain placeholder (`zeroGTestnet` with chainId 16600) as the specific 0G Testnet chain might not be published in viem/chains yet. RPC URL falls back to `https://evm-rpc.testnet.0g.ai`.
