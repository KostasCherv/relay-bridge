# React Doctor Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 4 react-doctor warnings in pages/index.tsx: inline render functions, array index keys, useState overload, and oversized component.

**Architecture:** Extract presentational components (StatusIcon, ChainIcon) first for quick wins, then extract container components (WalletConnection, BridgeForm, TransactionList) to reduce main component size, optionally useReducer for state management if complexity warrants it.

**Tech Stack:** React 18, TypeScript, Next.js, MUI, ethers.js

---

## Current State Analysis

**File:** `pages/index.tsx` (461 lines)
**Warnings:**
1. ⚠ Component "Home" has 9 useState calls
2. ⚠ Component "Home" is 401 lines
3. ⚠ Array index "index" used as key (line 410)
4. ⚠ Inline render function "renderStatusIcon()" (3 occurrences)

---

## Task 1: Extract StatusIcon Component

**Purpose:** Fix "inline render function" warning by extracting renderStatusIcon to a proper React component.

**Files:**
- Create: `components/StatusIcon.tsx`
- Modify: `pages/index.tsx:290-300` (remove inline function, use component)

**Step 1: Create StatusIcon component**

Create `components/StatusIcon.tsx`:
\`\`\`tsx
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface StatusIconProps {
  status: string;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
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
\`\`\`

**Step 2: Update pages/index.tsx to use StatusIcon**

Replace lines 290-300:
\`\`\`tsx
// REMOVE this function entirely:
// const renderStatusIcon = (status: string) => { ... }
\`\`\`

Replace line 413:
\`\`\`tsx
// FROM:
<TableCell>{renderStatusIcon(transaction.status)}</TableCell>
// TO:
<TableCell><StatusIcon status={transaction.status} /></TableCell>
\`\`\`

**Step 3: Add import**

Add at top of `pages/index.tsx`:
\`\`\`tsx
import { StatusIcon } from '../components/StatusIcon';
\`\`\`

**Step 4: Commit**
\`\`\`bash
git add components/StatusIcon.tsx pages/index.tsx
git commit -m "refactor: extract StatusIcon component from Home"
\`\`\`

---

## Task 2: Extract ChainIcon Component

**Purpose:** Fix second "inline render function" warning.

**Files:**
- Create: `components/ChainIcon.tsx`
- Modify: `pages/index.tsx:302-325` (remove inline function)

**Step 1: Create ChainIcon component**

Create `components/ChainIcon.tsx`:
\`\`\`tsx
import Image from 'next/image';
import ArbitrumIcon from '../public/arbitrum-icon.svg';
import OptimismIcon from '../public/optimism-icon.svg';

interface ChainIconProps {
  chain: string;
}

export const ChainIcon = ({ chain }: ChainIconProps) => {
  if (chain === 'arbitrum') {
    return (
      <Image
        src={ArbitrumIcon}
        alt="Arbitrum"
        width={24}
        height={24}
        style={{ verticalAlign: 'middle', marginRight: '4px' }}
      />
    );
  } else if (chain === 'optimism') {
    return (
      <Image
        src={OptimismIcon}
        alt="Optimism"
        width={24}
        height={24}
        style={{ verticalAlign: 'middle', marginRight: '4px' }}
      />
    );
  }
  return null;
};
\`\`\`

**Step 2: Update pages/index.tsx**

Remove lines 302-325 (renderChainIcon function).

Update lines 421 and 436:
\`\`\`tsx
// FROM:
{renderChainIcon(transaction.originChain)}
// TO:
<ChainIcon chain={transaction.originChain} />
\`\`\`

**Step 3: Add import**

\`\`\`tsx
import { ChainIcon } from '../components/ChainIcon';
\`\`\`

**Step 4: Commit**
\`\`\`bash
git add components/ChainIcon.tsx pages/index.tsx
git commit -m "refactor: extract ChainIcon component from Home"
\`\`\`

---

## Task 3: Fix Array Index Key

**Purpose:** Fix "Array index used as key" warning to prevent React reconciliation bugs.

**Files:**
- Modify: `pages/index.tsx:410-411`

**Step 1: Change key from index to transaction.id**

Update line 410-411:
\`\`\`tsx
// FROM:
{transactions.map((transaction, index) => (
  <TableRow key={index}>
// TO:
{transactions.map((transaction) => (
  <TableRow key={transaction.id || transaction.originTxHash || transaction.targetTxHash}>
\`\`\`

**Step 2: Verify Transaction type**

Ensure Transaction type has \`id\`, \`originTxHash\`, or \`targetTxHash\` field. If not, check what unique identifier the API returns.

**Step 3: Commit**
\`\`\`bash
git add pages/index.tsx
git commit -m "fix: use transaction id instead of array index as key"
\`\`\`

---

## Task 4: Extract WalletConnection Component

**Purpose:** Reduce Home component size by extracting wallet connection logic.

**Files:**
- Create: `components/WalletConnection.tsx`
- Modify: `pages/index.tsx:333-341` (wallet connection section)

**Step 1: Create WalletConnection component**

Create `components/WalletConnection.tsx`:
\`\`\`tsx
import { Button, Typography, Box } from '@mui/material';
import { ethers } from 'ethers';

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
\`\`\`

**Step 2: Update pages/index.tsx**

Replace lines 333-341:
\`\`\`tsx
// FROM:
{!walletConnected ? (
  <Button variant="contained" onClick={connectWallet}>
    Connect Wallet
  </Button>
) : (
  <Box>
    <Typography variant="body1" gutterBottom>
      Connected as: {userAddress}
    </Typography>
// TO:
<WalletConnection
  walletConnected={walletConnected}
  userAddress={userAddress}
  onConnect={connectWallet}
/>
{walletConnected && (
  <Box>
\`\`\`

**Step 3: Add import**

\`\`\`tsx
import { WalletConnection } from '../components/WalletConnection';
\`\`\`

**Step 4: Commit**
\`\`\`bash
git add components/WalletConnection.tsx pages/index.tsx
git commit -m "refactor: extract WalletConnection component"
\`\`\`

---

## Task 5: Extract BridgeForm Component

**Purpose:** Extract bridge form UI and logic into separate component.

**Files:**
- Create: `components/BridgeForm.tsx`
- Modify: `pages/index.tsx:342-391` (form section)

**Step 1: Create BridgeForm component**

Create `components/BridgeForm.tsx`:
\`\`\`tsx
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
\`\`\`

**Step 2: Update pages/index.tsx**

Replace lines 342-391 with:
\`\`\`tsx
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
\`\`\`

**Step 3: Add import**

\`\`\`tsx
import { BridgeForm } from '../components/BridgeForm';
\`\`\`

**Step 4: Commit**
\`\`\`bash
git add components/BridgeForm.tsx pages/index.tsx
git commit -m "refactor: extract BridgeForm component"
\`\`\`

---

## Task 6: Extract TransactionList Component

**Purpose:** Extract transaction table into separate component.

**Files:**
- Create: `components/TransactionList.tsx`
- Modify: `pages/index.tsx:394-453` (transactions section)

**Step 1: Create TransactionList component**

Create `components/TransactionList.tsx`:
\`\`\`tsx
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
\`\`\`

**Step 2: Update pages/index.tsx**

Replace lines 394-453:
\`\`\`tsx
// FROM:
<Typography variant="h5" gutterBottom>
  Your Transactions
</Typography>
{transactions.length > 0 ? (
  <TableContainer component={Paper}>...</TableContainer>
) : (
  <Typography variant="body2">No transactions found.</Typography>
)}

// TO:
<Typography variant="h5" gutterBottom>
  Your Transactions
</Typography>
<TransactionList transactions={transactions} />
\`\`\`

**Step 3: Add import**

\`\`\`tsx
import { TransactionList } from '../components/TransactionList';
\`\`\`

**Step 4: Commit**
\`\`\`bash
git add components/TransactionList.tsx pages/index.tsx
git commit -m "refactor: extract TransactionList component"
\`\`\`

---

## Task 7: Evaluate useReducer (Optional)

**Purpose:** Address "9 useState calls" warning if still relevant after component extraction.

**Decision Point:** After Tasks 1-6, check if Home component still has excessive useState. If it does:

**Option A: Keep as-is** — If component is now <200 lines and manageable

**Option B: Use useReducer** — If still complex, group state:
- \`bridgeState\`: amount, selectedChain, loading, faucetLoading
- \`walletState\`: walletConnected, userAddress
- \`uiState\`: error, msg
- \`dataState\`: transactions

**If implementing Option B:**

**Files:**
- Create: \`hooks/useBridgeState.ts\` or modify \`pages/index.tsx:59-67\`

**Step 1: Create reducer**

\`\`\`tsx
interface BridgeState {
  amount: string;
  selectedChain: string;
  loading: boolean;
  faucetLoading: boolean;
}

type BridgeAction =
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_CHAIN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FAUCET_LOADING'; payload: boolean }
  | { type: 'RESET_FORM' };

const bridgeReducer = (state: BridgeState, action: BridgeAction): BridgeState => {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_CHAIN':
      return { ...state, selectedChain: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FAUCET_LOADING':
      return { ...state, faucetLoading: action.payload };
    case 'RESET_FORM':
      return { ...state, amount: '', loading: false };
    default:
      return state;
  }
};
\`\`\`

**Step 2: Use in component**

\`\`\`tsx
const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, {
  amount: '',
  selectedChain: 'arbitrumSepolia',
  loading: false,
  faucetLoading: false,
});
\`\`\`

**Step 3: Commit (if implemented)**
\`\`\`bash
git add hooks/useBridgeState.ts pages/index.tsx
git commit -m "refactor: use useReducer for bridge form state"
\`\`\`

---

## Task 8: Verify with React Doctor

**Purpose:** Confirm all warnings are resolved.

**Files:** None (verification only)

**Step 1: Run react-doctor**

\`\`\`bash
npx -y react-doctor@latest .
\`\`\`

**Expected Output:**
- Score: 100/100
- Warnings: 0
- All 4 previous warnings resolved

**Step 2: If warnings remain**

Address any remaining issues based on doctor output.

**Step 3: Final commit**

\`\`\`bash
git add .
git commit -m "chore: verify react-doctor compliance - all warnings resolved"
\`\`\`

---

## Summary of Changes

| Task | Component | Lines Removed from Home | Warning Fixed |
|------|-----------|------------------------|---------------|
| 1 | StatusIcon | ~10 | Inline render function |
| 2 | ChainIcon | ~25 | Inline render function |
| 3 | Key fix | 0 | Array index as key |
| 4 | WalletConnection | ~15 | Component size |
| 5 | BridgeForm | ~50 | Component size |
| 6 | TransactionList | ~60 | Component size |
| 7 | useReducer (optional) | Varies | useState count |

**Expected final Home component size:** ~150-200 lines (down from 461)

---

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Chain switching works
- [ ] Bridge form submits
- [ ] Faucet works
- [ ] Add token to MetaMask works
- [ ] Transaction list displays with correct icons
- [ ] Status icons show correct colors
- [ ] Chain icons display correctly
- [ ] Links to explorers work
- [ ] No console errors
- [ ] React Doctor score = 100/100
