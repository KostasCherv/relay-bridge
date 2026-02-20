import {
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link as MuiLink,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { ethers } from 'ethers';
import { StatusIcon } from './StatusIcon';
import { ChainIcon } from './ChainIcon';

interface Transaction {
  id?: string;
  amount: string;
  status: string;
  originTxHash?: string;
  targetTxHash?: string;
  originChain: string;
  targetChain: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const explorers: { [key: string]: string } = {
  arbitrum: 'https://sepolia.arbiscan.io/tx/',
  optimism: 'https://sepolia-optimistic.etherscan.io/tx/',
};

const getExplorerLink = (chain: string, txHash: string) => {
  return explorers[chain] + txHash;
};

export const TransactionList = ({ transactions }: TransactionListProps) => {
  if (transactions.length === 0) {
    return <Typography variant="body2">No transactions found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Origin Tx</TableCell>
            <TableCell>Target Tx</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id || transaction.originTxHash || transaction.targetTxHash}>
              <TableCell>{ethers.formatEther(transaction.amount)} MCK</TableCell>
              <TableCell><StatusIcon status={transaction.status} /></TableCell>
              <TableCell>
                {transaction.originTxHash ? (
                  <MuiLink
                    href={getExplorerLink(transaction.originChain, transaction.originTxHash)}
                    target="_blank"
                    rel="noopener"
                  >
                    <ChainIcon chain={transaction.originChain} />
                    <LinkIcon style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {transaction.originTxHash.slice(0, 4)}...{transaction.originTxHash.slice(-4)}
                  </MuiLink>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                {transaction.targetTxHash ? (
                  <MuiLink
                    href={getExplorerLink(transaction.targetChain, transaction.targetTxHash)}
                    target="_blank"
                    rel="noopener"
                  >
                    <ChainIcon chain={transaction.targetChain} />
                    <LinkIcon style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {transaction.targetTxHash.slice(0, 4)}...{transaction.targetTxHash.slice(-4)}
                  </MuiLink>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
