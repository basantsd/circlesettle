import { NexusSDK } from  "@avail-project/nexus-core";
import type { NexusNetwork } from  "@avail-project/nexus-core";

// Avail Nexus configuration
// WARNING: This file imports Node.js-specific libraries and should ONLY be used server-side
// For client components, import SUPPORTED_CHAINS from '@/lib/chains' instead
export const createNexusClient = () => {
  return new NexusSDK({ network: 'testnet' as NexusNetwork });
}