// Determine if we're in development mode
const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true'

// Testnet chains configuration
const TESTNET_CHAINS = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
    rpc: 'https://rpc.sepolia.org',
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    symbol: 'MATIC',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
    rpc: 'https://rpc-amoy.polygon.technology',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
    rpc: 'https://sepolia.base.org',
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
  },
  {
    id: 296,
    name: 'Hedera Testnet',
    symbol: 'HBAR',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png',
    rpc: 'https://testnet.hashio.io/api',
  },
]

// Mainnet chains configuration
const MAINNET_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
    rpc: 'https://eth.llamarpc.com',
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
    rpc: 'https://polygon-rpc.com',
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
    rpc: 'https://mainnet.base.org',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
    rpc: 'https://arb1.arbitrum.io/rpc',
  },
  {
    id: 295,
    name: 'Hedera Mainnet',
    symbol: 'HBAR',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png',
    rpc: 'https://mainnet.hashio.io/api',
  },
]

// Export the appropriate chains based on environment
export const SUPPORTED_CHAINS = isTestnet ? TESTNET_CHAINS : MAINNET_CHAINS

// Testnet USDC addresses
const TESTNET_USDC = {
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
  80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
}

// Mainnet USDC addresses
const MAINNET_USDC = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
}

// Bridge tokens configuration
export const BRIDGE_TOKENS = {
  USDC: isTestnet ? TESTNET_USDC : MAINNET_USDC,
}