# Sample Hardhat Project
This project showcases a basic MockERC20 that is compatible with the ERC2771Context. For more information, please visit [this link](https://docs.gelato.network/web3-services/relay/erc-2771-recommended).

This contract is used for bridging tokens between Arbitrum Sepolia and Optimism Sepolia.

## Setup
To set up the project, follow these steps:
1. Copy the content of `.env.example` and create a new file called `.env` in the root directory.
2. Fill in the necessary values in the `.env` file.

## Deploy and Verify Contract
To deploy and verify the contract, run the following commands:
- `npx hardhat run scripts/deploy.ts --network arbitrumSepolia`
- `npx hardhat run scripts/deploy.ts --network optimismSepolia`

