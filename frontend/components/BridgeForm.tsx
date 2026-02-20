import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';

interface BridgeFormProps {
  selectedChain: string;
  amount: string;
  loading: boolean;
  faucetLoading: boolean;
  onChainChange: (chain: string) => void;
  onAmountChange: (amount: string) => void;
  onBridge: () => void;
  onFaucet: () => void;
  onAddToken: () => void;
}

export const BridgeForm = ({
  selectedChain,
  amount,
  loading,
  faucetLoading,
  onChainChange,
  onAmountChange,
  onBridge,
  onFaucet,
  onAddToken,
}: BridgeFormProps) => {
  return (
    <Box>
      <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
        <InputLabel id="source-chain-label">Source Chain</InputLabel>
        <Select
          labelId="source-chain-label"
          value={selectedChain}
          label="Source Chain"
          onChange={(e) => onChainChange(e.target.value)}
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
        onChange={(e) => onAmountChange(e.target.value)}
        sx={{ marginBottom: '1rem' }}
      />
      <Button
        variant="contained"
        onClick={onBridge}
        disabled={loading}
        fullWidth
        sx={{ marginBottom: '1rem' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Bridge Tokens'}
      </Button>
      <Button
        variant="outlined"
        onClick={onFaucet}
        disabled={faucetLoading}
        fullWidth
        sx={{ marginBottom: '1rem' }}
      >
        {faucetLoading ? <CircularProgress size={24} /> : 'Get Faucet Tokens'}
      </Button>
      <Button
        variant="outlined"
        onClick={onAddToken}
        fullWidth
        sx={{ marginBottom: '1rem' }}
      >
        Add Token to MetaMask
      </Button>
    </Box>
  );
};
