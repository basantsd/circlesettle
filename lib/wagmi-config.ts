import { createConfig, http } from 'wagmi'
import { hederaTestnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'CircleSettle',
  projectId: "88c4ba4dfc273adae1ea18c541c584ce", // Get from walletconnect.com
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC),
  },
})