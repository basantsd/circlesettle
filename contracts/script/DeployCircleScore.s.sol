// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CircleScore.sol";
import "../src/MicroDebtTracker.sol";

contract DeployCircleScore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy CircleScore first
        CircleScore circleScore = new CircleScore();
        console.log("CircleScore deployed at:", address(circleScore));

        // Deploy MicroDebtTracker with CircleScore address
        MicroDebtTracker debtTracker = new MicroDebtTracker(address(circleScore));
        console.log("MicroDebtTracker deployed at:", address(debtTracker));

        vm.stopBroadcast();

        // Save deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("CircleScore:", address(circleScore));
        console.log("MicroDebtTracker:", address(debtTracker));
    }
}
