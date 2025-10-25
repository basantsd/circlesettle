import MicroDebtTrackerABI from './MicroDebtTracker.json'
import type { Abi } from 'viem'

// Replace with YOUR deployed contract address from Day 1
export const MICRO_DEBT_TRACKER_ADDRESS = '0x45227a0BB3551EFe853DBb03f3a60909c4cea7eE' as const

export const MICRO_DEBT_TRACKER_ABI = MicroDebtTrackerABI.abi as Abi