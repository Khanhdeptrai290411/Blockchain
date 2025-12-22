import CloseIcon from '@mui/icons-material/Close';
import GavelIcon from '@mui/icons-material/Gavel';
import { Box, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { resolveIpfsUri } from '../utils';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

function CreateAuctionFromNftModal({ open, onClose, nft, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();
  const [vars, setVars] = useState({
    startingBid: '',
    increment: '',
    duration: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!nft || !nft.nftAddress || !nft.tokenId) {
      enqueueSnackbar('NFT information is missing', { variant: 'error' });
      return;
    }

    const startingBidNum = Number(vars.startingBid);
    const incrementNum = Number(vars.increment);
    const durationNum = Number(vars.duration);

    if (!Number.isFinite(startingBidNum) || startingBidNum <= 0) {
      enqueueSnackbar('Starting Bid must be greater than 0', {
        variant: 'error',
      });
      return;
    }
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      enqueueSnackbar('Duration must be greater or equal to 1 hour', {
        variant: 'error',
      });
      return;
    }

    if (!Number.isFinite(incrementNum) || incrementNum <= 0) {
      enqueueSnackbar('Increment must be greater than 0', { variant: 'error' });
      return;
    }

    const auctionJson = require('../contracts/AuctionFactory.json');
    const auctionAddress = auctionJson.networks[networkID].address;
    const auctionFactoryContract = new web3.eth.Contract(
      auctionJson.abi,
      auctionAddress
    );

    try {
      setLoading(true);
      // Convert from ETH to wei (1 ETH = 10^18 wei)
      const startingBidWei = web3.utils.toWei(
        startingBidNum.toString(),
        'ether'
      );
      const incrementWei = web3.utils.toWei(incrementNum.toString(), 'ether');

      const val = await auctionFactoryContract.methods
        .createNewAuction(
          nft.nftAddress,
          nft.tokenId,
          startingBidWei,
          incrementWei,
          durationNum * 60 * 60 // convert from hours to seconds
        )
        .send({ from: accounts[0] });
      
      const auctionDeployedAddress =
        val.events.ContractCreated.returnValues.newContractAddress;
      console.log('Auction created at:', auctionDeployedAddress);
      
      enqueueSnackbar('Auction Created Successfully!', { variant: 'success' });
      setVars({
        startingBid: '',
        increment: '',
        duration: '',
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating auction:', err);
      enqueueSnackbar('Transaction Rejected or Failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!nft) return null;

  const m = nft.metadata || {};
  const rawImg =
    m.image ||
    m.image_url ||
    m.imageUrl ||
    m.animation_url ||
    m.thumbnail ||
    null;
  const imgSrc = rawImg ? resolveIpfsUri(rawImg) : null;

  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="create-auction-dialog-title"
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <BootstrapDialogTitle
        id="create-auction-dialog-title"
        onClose={onClose}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Create Auction for NFT
          </Typography>
        </Box>
      </BootstrapDialogTitle>
      <DialogContent dividers>
        {/* NFT Preview */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {imgSrc && (
            <Box
              component="img"
              src={imgSrc}
              alt={m.name || `Token #${nft.tokenId}`}
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 2,
                mb: 2,
                objectFit: 'contain',
              }}
            />
          )}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {m.name || `Token #${nft.tokenId}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Token ID: {nft.tokenId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
            NFT: {nft.nftAddress}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleCreate} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="startingBid"
            label="Starting Bid (ETH)"
            name="startingBid"
            type="number"
            inputProps={{ min: 0, step: '0.0001' }}
            value={vars.startingBid}
            onChange={(event) => {
              setVars({
                ...vars,
                startingBid: event.target.value,
              });
            }}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="increment"
            label="Minimum Increment (ETH)"
            id="increment"
            type="number"
            inputProps={{ min: 0, step: '0.0001' }}
            value={vars.increment}
            onChange={(event) => {
              setVars({
                ...vars,
                increment: event.target.value,
              });
            }}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="duration"
            label="Duration (hours)"
            id="duration"
            type="number"
            inputProps={{ min: 1 }}
            value={vars.duration}
            onChange={(event) => {
              setVars({
                ...vars,
                duration: event.target.value,
              });
            }}
            disabled={loading}
          />
          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                },
              }}
            >
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </BootstrapDialog>
  );
}

CreateAuctionFromNftModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nft: PropTypes.shape({
    tokenId: PropTypes.number.isRequired,
    nftAddress: PropTypes.string.isRequired,
    metadata: PropTypes.object,
  }).isRequired,
  onSuccess: PropTypes.func,
};

export default CreateAuctionFromNftModal;

