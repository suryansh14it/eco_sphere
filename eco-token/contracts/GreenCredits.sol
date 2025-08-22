// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenCredits is ERC20, Ownable {
    constructor() ERC20("GreenCredits", "GC") Ownable(msg.sender) {}

    function mintTokens(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
