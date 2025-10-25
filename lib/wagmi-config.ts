import { http } from 'wagmi'
import { mainnet, polygon, base, arbitrum, sepolia, polygonAmoy, baseSepolia, arbitrumSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true'

// Define Hedera testnet
export const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
})

// Define Hedera mainnet
export const hederaMainnet = defineChain({
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
})

// Select chains and transports based on environment
export const config = isTestnet
  ? getDefaultConfig({
      appName: 'CircleSettle',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      chains: [hederaTestnet, sepolia, polygonAmoy, baseSepolia, arbitrumSepolia],
      transports: {
        [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
        [sepolia.id]: http('https://rpc.sepolia.org'),
        [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology'),
        [baseSepolia.id]: http('https://sepolia.base.org'),
        [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
      },
    })
  : getDefaultConfig({
      appName: 'CircleSettle',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      chains: [hederaMainnet, mainnet, polygon, base, arbitrum],
      transports: {
        [hederaMainnet.id]: http('https://mainnet.hashio.io/api'),
        [mainnet.id]: http('https://eth.llamarpc.com'),
        [polygon.id]: http('https://polygon-rpc.com'),
        [base.id]: http('https://mainnet.base.org'),
        [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
      },
    })