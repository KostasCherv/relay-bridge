import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Container,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { WalletConnection } from '../components/WalletConnection';
import { BridgeForm } from '../components/BridgeForm';
import { TransactionList } from '../components/TransactionList';

const chains: { [key: string]: number } = {
  arbitrumSepolia: 421614,
  optimismSepolia: 11155420,
};

const tokenDetails: { [key: string]: { address: string; symbol: string; decimals: number; image: string } } = {
  arbitrumSepolia: {
    address: process.env.NEXT_PUBLIC_ARBITRUM_TOKEN_ADDRESS!,
    symbol: 'MCK',
    decimals: 18,
    image: 'https://example.com/token-image.png', // Replace with the actual image URL for your token
  },
  optimismSepolia: {
    address: process.env.NEXT_PUBLIC_OPTIMISM_TOKEN_ADDRESS!,
    symbol: 'MCK',
    decimals: 18,
    image: 'https://example.com/token-image.png', // Replace with the actual image URL for your token
  },
};

const Home = () => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [faucetLoading, setFaucetLoading] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<string>('arbitrumSepolia');
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (walletConnected && userAddress) {
      fetchTransactions();
    }
  }, [walletConnected, userAddress]);

  const checkWalletConnection = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setUserAddress(ethers.getAddress(accounts[0]));
          await switchNetwork(selectedChain);
        }
      } catch (error) {
        console.error('Error checking wallet connection: ', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask to use this feature!');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setUserAddress(ethers.getAddress(accounts[0]));
      await switchNetwork(selectedChain);
    } catch (error) {
      console.error('Error connecting wallet: ', error);
    }
  };

  const switchNetwork = async (chain: string) => {
    const chainId = `0x${chains[chain].toString(16)}`;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        alert('Network not found in MetaMask, please add it manually.');
      } else {
        console.error('Error switching network: ', error);
      }
    }
  };

  const handleBridge = async () => {
    if (!amount) {
      alert('Please enter an amount to bridge');
      return;
    }

    const latestTransaction = transactions.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (latestTransaction && Date.now() - new Date(latestTransaction.createdAt).getTime() < 60000) {
      const diff = Date.now() - new Date(latestTransaction.createdAt).getTime();
      alert(
        'Please wait at least one minute between transactions. Try again in ' +
          (60 - Math.floor(diff / 1000)) +
          ' seconds.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the provider based on the selected chain
      const rpcUrl =
        selectedChain === 'arbitrumSepolia'
          ? process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL
          : process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL;
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // Fetch the token contract address based on the selected chain
      const tokenAddress =
        selectedChain === 'arbitrumSepolia'
          ? process.env.NEXT_PUBLIC_ARBITRUM_TOKEN_ADDRESS
          : process.env.NEXT_PUBLIC_OPTIMISM_TOKEN_ADDRESS;

      // Create a contract instance
      const tokenContract = new ethers.Contract(
        tokenAddress!,
        [
          // Only the balanceOf ABI is needed for this check
          'function balanceOf(address owner) view returns (uint256)',
        ],
        provider
      );

      // Get the user's token balance
      const userBalance = await tokenContract.balanceOf(ethers.getAddress(userAddress));
      const parsedAmount = ethers.parseEther(amount);
      // Check if the user has enough balance
      if (userBalance < parsedAmount) {
        alert('Insufficient balance to bridge the specified amount.');
        setLoading(false);
        return;
      }


      // If balance is sufficient, proceed with the bridge request
      const data = {
        user: userAddress,
        chain: selectedChain.replace('Sepolia', ''),
        amount: parseInt(parsedAmount.toString()),
      };
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [accounts[0], JSON.stringify(data)],
      });
      const response = await axios.post('https://relay-bridge-production.up.railway.app/api/bridge/burn', {
        data, signature
      });

      if (response.status === 200) {
        setMsg('Bridge Request Sent!');
        setTimeout(() => setMsg(null), 5000);
        await fetchTransactions();
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error('Error bridging tokens: ', error);
      setError('Error bridging tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    setError(null);

    try {
      const body = {
        user: userAddress,
        chain: selectedChain.replace('Sepolia', ''),
        amount: parseInt(ethers.parseEther('10').toString()),
      };

      const response = await axios.post('https://relay-bridge-production.up.railway.app/api/bridge/mint', body);

      if (response.status === 200) {
        setMsg('Faucet Request Successful! 10 tokens have been minted to your account.');
        setTimeout(() => setMsg(null), 5000);
        await fetchTransactions();
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error('Error getting faucet tokens:', error);
      setError('Error getting faucet tokens. Please try again.');
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleAddTokenToMetaMask = async () => {
    try {
      const token = tokenDetails[selectedChain];

      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image,
          },
        },
      });
      setMsg('Token added to MetaMask!');
      setTimeout(() => setMsg(null), 5000);
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      setError('Error adding token to MetaMask. Please try again.');
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const limit = 5;
      const page = 0;
      const response = await axios.get(
        `https://relay-bridge-production.up.railway.app/api/bridge/transactions/${userAddress}?limit=${limit}&page=${page}`
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions: ', error);
      setError('Error fetching transactions. Please try again.');
    }
  }, [userAddress]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (transactions.filter((tx) => tx.status === 'pending').length > 0) {
        await fetchTransactions();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [transactions, fetchTransactions]);

  return (
    <Container maxWidth="md">
      <Box sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Bridge Tokens
        </Typography>
        <WalletConnection
          walletConnected={walletConnected}
          userAddress={userAddress}
          onConnect={connectWallet}
        />
        {walletConnected && (
          <Box>
            <BridgeForm
              selectedChain={selectedChain}
              amount={amount}
              loading={loading}
              faucetLoading={faucetLoading}
              onChainChange={async (chain) => {
                setSelectedChain(chain);
                await switchNetwork(chain);
              }}
              onAmountChange={setAmount}
              onBridge={handleBridge}
              onFaucet={handleFaucet}
              onAddToken={handleAddTokenToMetaMask}
            />
            {error && <Alert severity="error">{error}</Alert>}
            {msg && <Alert severity="success">{msg}</Alert>}
            <Typography variant="h5" gutterBottom>
              Your Transactions
            </Typography>
            <TransactionList transactions={transactions} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;
