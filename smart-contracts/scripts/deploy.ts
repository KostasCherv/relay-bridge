import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const trustedForwarder = process.env.TRUSTED_FORWARDER_ADDRESS!;
  
  const token = await MockERC20.deploy("Mock Token", "MCK", trustedForwarder);

  await token.waitForDeployment();

  console.log("MockERC20 deployed to:", token.target)

  await token.adminMint(deployer.address, ethers.parseEther("1000"));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
