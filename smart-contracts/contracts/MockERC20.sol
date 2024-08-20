// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    address public bridgeOperator;

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        bridgeOperator = msg.sender;
    }

    function setBridgeOperator(address _bridgeOperator) external onlyOwner {
        bridgeOperator = _bridgeOperator;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == bridgeOperator, "Only bridge operator can mint");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
