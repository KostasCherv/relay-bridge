import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const trustedForwarder = process.env.TRUSTED_FORWARDER_ADDRESS!;
  const burnFeePercentage = process.env.BURN_FEE_PERCENTAGE!;

  const token = await MockERC20.deploy("Mock Token", "MCK", trustedForwarder, burnFeePercentage);

  await token.waitForDeployment();

  const contractAddress = token.target;
  console.log("MockERC20 deployed to:", contractAddress);

  await token.adminMint(deployer.address, ethers.parseEther("1000"));

  saveDeploymentAddress(network.name, contractAddress.toString());

  await verifyContract(contractAddress.toString(), ["Mock Token", "MCK", trustedForwarder, burnFeePercentage]);
}

function saveDeploymentAddress(networkName: string, contractAddress: string) {
  const filePath = "./deployedAddresses.json";
  let addresses: { [key: string]: string } = {};

  // Read the existing file if it exists
  if (fs.existsSync(filePath)) {
    addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // Save the address for the current network
  addresses[networkName] = contractAddress;

  // Write the updated addresses back to the file
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

  console.log(`Address for ${networkName} saved to ${filePath}`);
}

async function verifyContract(address: string, constructorArguments: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log("Contract verified successfully.");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
