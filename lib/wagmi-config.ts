import { createConfig, http } from 'wagmi'
import { mainnet, polygon, base, arbitrum, sepolia, polygonAmoy, baseSepolia, arbitrumSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true'

// Define Hedera testnet
export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
    public: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
  iconUrl: 'https://cryptologos.cc/logos/hedera-hbar-logo.svg',
} as const

// Define Hedera mainnet
export const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  network: 'hedera-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
    public: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
  iconUrl: 'https://cryptologos.cc/logos/hedera-hbar-logo.svg',
} as const

// Select chains based on environment
const chains = isTestnet
  ? [hederaTestnet, sepolia, polygonAmoy, baseSepolia, arbitrumSepolia]
  : [hederaMainnet, mainnet, polygon, base, arbitrum]

const transports = isTestnet
  ? {
      [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
      [sepolia.id]: http('https://rpc.sepolia.org'),
      [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology'),
      [baseSepolia.id]: http('https://sepolia.base.org'),
      [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    }
  : {
      [hederaMainnet.id]: http('https://mainnet.hashio.io/api'),
      [mainnet.id]: http('https://eth.llamarpc.com'),
      [polygon.id]: http('https://polygon-rpc.com'),
      [base.id]: http('https://mainnet.base.org'),
      [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    }

export const config = getDefaultConfig({
  appName: 'CircleSettle',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: chains as readonly [typeof chains[0], ...typeof chains[]],
  transports,
})