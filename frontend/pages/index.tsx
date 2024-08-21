import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Container,
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  CircularProgress,
  Alert,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';
import ArbitrumIcon from '../public/arbitrum-icon.svg';
import OptimismIcon from '../public/optimism-icon.svg';
import Image from 'next/image';


const chains: { [key: string]: number } = {
  arbitrumSepolia: 421614,
  optimismSepolia: 11155420,
};

const explorers: { [key: string]: string } = {
  arbitrum: 'https://sepolia.arbiscan.io/tx/',
  optimism: 'https://sepolia-optimistic.etherscan.io/tx/',
};


const Home = () => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<string>('arbitrumSepolia');
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        console.error("Error checking wallet connection: ", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("Please install MetaMask to use this feature!");
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setUserAddress(ethers.getAddress(accounts[0]));
      console.log(accounts[0]);
      await switchNetwork(selectedChain);
    } catch (error) {
      console.error("Error connecting wallet: ", error);
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
        alert("Network not found in MetaMask, please add it manually.");
      } else {
        console.error("Error switching network: ", error);
      }
    }
  };

  const handleBridge = async () => {
    if (!amount) {
      alert('Please enter an amount to bridge');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        user: userAddress,
        chain: selectedChain.replace('Sepolia', ''),
        amount: parseInt(ethers.parseEther(amount).toString()),
      }
      const response = await axios.post('https://relay-bridge-production.up.railway.app/api/bridge/burn', body);
      if (response.status === 200) {
        alert('Tokens bridged successfully!');
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error("Error bridging tokens: ", error);
      setError("Error bridging tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`https://relay-bridge-production.up.railway.app/api/bridge/transactions/${userAddress}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      setError("Error fetching transactions. Please try again.");
    }
  };

  const getExplorerLink = (chain: string, txHash: string) => {
    return explorers[chain] + txHash;
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon style={{ color: 'green' }} />;
      case 'failed':
        return <ErrorIcon style={{ color: 'red' }} />;
      case 'pending':
      default:
        return <HourglassEmptyIcon style={{ color: 'orange' }} />;
    }
  };

  const renderChainIcon = (chain: string) => {
  if (chain === 'arbitrum') {
    return <Image src={ArbitrumIcon} alt="Arbitrum" width={24} height={24} style={{ verticalAlign: 'middle', marginRight: '4px' }} />;
  } else if (chain === 'optimism') {
    return <Image src={OptimismIcon} alt="Optimism" width={24} height={24} style={{ verticalAlign: 'middle', marginRight: '4px' }} />;
  }
  return null;
};

  return (
    <Container maxWidth="md">
      <Box sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Bridge Tokens
        </Typography>
        {!walletConnected ? (
          <Button variant="contained" onClick={connectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Connected as: {userAddress}
            </Typography>
            <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
              <InputLabel id="source-chain-label">Source Chain</InputLabel>
              <Select
                labelId="source-chain-label"
                value={selectedChain}
                label="Source Chain"
                onChange={async (e) => {
                  setSelectedChain(e.target.value);
                  await switchNetwork(e.target.value);
                }}
              >
                <MenuItem value="arbitrumSepolia">Arbitrum Sepolia</MenuItem>
                <MenuItem value="optimismSepolia">Optimism Sepolia</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Amount to Bridge"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ marginBottom: '1rem' }}
            />
            <Button
              variant="contained"
              onClick={handleBridge}
              disabled={loading}
              fullWidth
              sx={{ marginBottom: '1rem' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Bridge Tokens'}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="h5" gutterBottom>
              Your Transactions
            </Typography>
            {transactions.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Origin Tx</TableCell>
                      <TableCell>Target Tx</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{ethers.formatEther(transaction.amount)} MCK</TableCell>
                        <TableCell>{renderStatusIcon(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.originTxHash ? (
                            <MuiLink href={getExplorerLink(transaction.originChain, transaction.originTxHash)} target="_blank" rel="noopener">
                              {renderChainIcon(transaction.originChain)}
                              <LinkIcon style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                              {transaction.originTxHash.slice(0, 4)}...{transaction.originTxHash.slice(-4)}
                            </MuiLink>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {transaction.targetTxHash ? (
                            <MuiLink href={getExplorerLink(transaction.targetChain, transaction.targetTxHash)} target="_blank" rel="noopener">
                              {renderChainIcon(transaction.targetChain)}
                              <LinkIcon style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                              {transaction.targetTxHash.slice(0, 4)}...{transaction.targetTxHash.slice(-4)}
                            </MuiLink>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2">No transactions found.</Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;
