// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC2771Context} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract MockERC20 is ERC20, ERC2771Context, Ownable {
    address public bridgeOperator;
    uint256 public burnFeePct; // Burn fee percentage (e.g., 100 = 1%)

    constructor(
        string memory name,
        string memory symbol,
        address trustedForwarder, // The trusted forwarder address for ERC2771Context
        uint256 _burnFeePct // Initial burn fee percentage
    )
        ERC20(name, symbol)
        ERC2771Context(trustedForwarder)
        Ownable(_msgSender())
    {
        bridgeOperator = _msgSender();
        burnFeePct = _burnFeePct;
    }

    modifier onlyBridgeOperator() {
        require(
            _msgSender() == bridgeOperator,
            "Only bridge operator can call this function"
        );
        _;
    }

    function setBridgeOperator(address _bridgeOperator) external onlyOwner {
        bridgeOperator = _bridgeOperator;
    }

    function setBurnFeePct(uint256 _burnFeePct) external onlyOwner {
        burnFeePct = _burnFeePct;
    }

    function mint(address to, uint256 amount) external onlyBridgeOperator {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyBridgeOperator {
        uint256 fee = (amount * burnFeePct) / 10000;

        // Burn the amount after fee
        _burn(from, amount);

        // Mint the fee to the bridge operator
        if (fee > 0) {
            _mint(bridgeOperator, fee);
        }
    }

    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Override _msgSender() and _msgData() to use the ERC2771Context versions
    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
