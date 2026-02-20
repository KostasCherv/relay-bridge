import { Button, Typography, Box } from '@mui/material';

interface WalletConnectionProps {
  walletConnected: boolean;
  userAddress: string;
  onConnect: () => void;
}

export const WalletConnection = ({
  walletConnected,
  userAddress,
  onConnect,
}: WalletConnectionProps) => {
  if (!walletConnected) {
    return (
      <Button variant="contained" onClick={onConnect}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Connected as: {userAddress}
      </Typography>
    </Box>
  );
};
