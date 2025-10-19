// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MicroDebtTracker.sol";

contract AddTestDebt is Script {
    function run() external {
        address contractAddress = 0x45227a0BB3551EFe853DBb03f3a60909c4cea7eE; 
        
        uint256 deployerPrivateKey = vm.envUint("HEDERA_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MicroDebtTracker tracker = MicroDebtTracker(contractAddress);
        
        address creditor = 0xA6ecFb72e702809F7070fB0a553Cc4D4d4c1Ad06;
        address debtor = vm.addr(deployerPrivateKey);
        uint256 amount = 50 ether; // $50
        
        tracker.addDebt(creditor, debtor, amount);
        
        console.log("Test debt created!");
        
        vm.stopBroadcast();
    }
}