import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY || '',
  relayerApiKey: process.env.RELAYER_API_KEY || '',
  chains: {
    arbitrum: {
      chainId: parseInt(process.env.ARBITRUM_CHAIN_ID || '421614', 10),
      tokenAddress: process.env.ARBITRUM_TOKEN_ADDRESS || '',
      provider: new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL || ''),
    },
    optimism: {
      chainId: parseInt(process.env.OPTIMISM_CHAIN_ID || '11155420', 10),
      tokenAddress: process.env.OPTIMISM_TOKEN_ADDRESS || '',
      provider: new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL || ''),
    },
  },
};
