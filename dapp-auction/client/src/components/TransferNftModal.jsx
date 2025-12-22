import React, { useState } from 'react';
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import { useEth } from '../contexts/EthContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function TransferNftModal({ nft, open, onClose, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, accounts, networkID },
  } = useEth();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!web3 || !accounts || accounts.length === 0) {
      enqueueSnackbar('Wallet not connected', { variant: 'error' });
      return;
    }

    if (!recipientAddress.trim()) {
      enqueueSnackbar('Please enter recipient address', { variant: 'error' });
      return;
    }

    // Validate address format
    if (!web3.utils.isAddress(recipientAddress.trim())) {
      enqueueSnackbar('Invalid Ethereum address format', { variant: 'error' });
      return;
    }

    const toAddress = web3.utils.toChecksumAddress(recipientAddress.trim());

    // Don't allow transferring to self
    if (toAddress.toLowerCase() === accounts[0].toLowerCase()) {
      enqueueSnackbar('Cannot transfer to your own address', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const mintNftJson = require('../contracts/MintNFT.json');
      const deployed = mintNftJson.networks?.[networkID];
      if (!deployed?.address) {
        enqueueSnackbar('MintNFT contract not deployed on this network', {
          variant: 'error',
        });
        setLoading(false);
        return;
      }

      const mintNftContract = new web3.eth.Contract(
        mintNftJson.abi,
        deployed.address
      );

      enqueueSnackbar('Transferring NFT...', { variant: 'info' });

      await mintNftContract.methods
        .transferFrom(accounts[0], toAddress, nft.tokenId)
        .send({ from: accounts[0] });

      enqueueSnackbar(
        `NFT transferred successfully to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
        { variant: 'success' }
      );

      setRecipientAddress('');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('[TransferNftModal] Transfer failed:', err);
      let errorMsg = 'Transfer failed';
      if (err.message) {
        if (err.message.includes('revert')) {
          const match = err.message.match(/revert (.+)/);
          if (match) {
            errorMsg = match[1];
          } else {
            errorMsg = 'Transfer failed: Contract reverted';
          }
        } else if (err.message.includes('User denied')) {
          errorMsg = 'Transaction rejected by user';
        } else {
          errorMsg = err.message;
        }
      }
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Transfer NFT
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            NFT Details
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {nft.metadata?.name || `Token #${nft.tokenId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Token ID: {nft.tokenId}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Recipient Address"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          sx={{ mb: 3 }}
          disabled={loading}
          helperText="Enter the Ethereum address to receive this NFT"
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={loading || !recipientAddress.trim()}
            startIcon={<SendIcon />}
          >
            {loading ? 'Transferring...' : 'Transfer NFT'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default TransferNftModal;

