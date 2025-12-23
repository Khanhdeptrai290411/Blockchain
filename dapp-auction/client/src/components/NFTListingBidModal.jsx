import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { displayInGwei, displayInEth } from '../utils';
import CountdownTimer from './CountdownTimer';
import { Chip, Divider as MuiDivider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  border: 'none',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function getRPCErrorMessage(err) {
  let msg = '';
  console.log(err);
  try {
    var open = err.message.indexOf('{');
    var close = err.message.lastIndexOf('}');
    var j_s = err.message.substring(open, close + 1);
    var j = JSON.parse(j_s);

    msg = j.value.data.message;
    open = msg.indexOf('revert');
    close = msg.length;
    msg = msg.substring(open + 7, close);
  } catch (err) {
    msg = 'An error occurred';
  }

  return msg;
}

const logAuctionData = async (auctionData) => {
  console.log('Auction data: ', auctionData);
};

const calculateTimeTillExpiry = (auctionData) => {
  const expiryTime = auctionData.endAt;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeTillExpiryInSeconds = expiryTime - currentTime;
  return {
    timeTillExpiryHours: Math.floor(timeTillExpiryInSeconds / 3600),
    timeTillExpiryMinutes: Math.floor((timeTillExpiryInSeconds % 3600) / 60),
    timeTillExpirySeconds: timeTillExpiryInSeconds % 60,
  };
};

function NFTListingBidModal({ pinataMetadata, auctionData, refetchData }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { accounts, web3 },
  } = useEth();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    refetchData();
  };
  const [highestBid, setHighestBid] = useState(auctionData.highestBid);
  const [highestBidder, setHighestBidder] = useState(auctionData.highestBidder);
  const [role, setRole] = useState('bidder'); // 'seller', 'highestBidder', 'bidder', 'notBidder
  const { timeTillExpiryHours, timeTillExpiryMinutes, timeTillExpirySeconds } =
    calculateTimeTillExpiry(auctionData);
  const [currBidAmount, setCurrBidAmount] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  useEffect(() => {
    if (accounts[0] === auctionData.seller) {
      setRole('seller');
    } else if (accounts[0] === highestBidder) {
      setRole('highestBidder');
    } else if (auctionData.userBidAmount > 0) {
      setRole('bidder');
    } else {
      setRole('notBidder');
    }
  }, [
    accounts,
    highestBidder,
    auctionData.seller,
    auctionData.userBidAmount,
    open,
  ]);

  // Check approval status when modal opens
  useEffect(() => {
    const checkApproval = async () => {
      if (!web3 || !accounts || accounts.length === 0 || !auctionData.auctionContract || auctionData.started) {
        setIsApproved(true); // Assume approved if auction already started
        return;
      }
      
      if (accounts[0]?.toLowerCase() !== auctionData.seller?.toLowerCase()) {
        setIsApproved(true); // Not seller, don't need to check
        return;
      }

      try {
        setCheckingApproval(true);
        const mintNftJson = require('../contracts/MintNFT.json');
        const mintNftContract = new web3.eth.Contract(
          mintNftJson.abi,
          auctionData.nft
        );
        const approvedAddress = await mintNftContract.methods
          .getApproved(auctionData.nftId)
          .call();
        const auctionAddress = auctionData.auctionContract._address.toLowerCase();
        setIsApproved(approvedAddress.toLowerCase() === auctionAddress);
      } catch (err) {
        console.warn('Failed to check approval:', err);
        setIsApproved(false);
      } finally {
        setCheckingApproval(false);
      }
    };

    if (open) {
      checkApproval();
    }
  }, [open, web3, accounts, auctionData, auctionData.auctionContract]);

  // As soon as auctionContract is ready, we'll register our Solidity event listener on Auction.bid()
  useEffect(() => {
    if (auctionData.auctionContract !== null) {
      auctionData.auctionContract.events.Bid({}, (err, res) => {
        setHighestBid(parseInt(res.returnValues.amount));
        setHighestBidder(parseInt(res.returnValues.sender));
        if (err) {
          console.log(err);
        }
      });
    }
  }, [auctionData.auctionContract, setHighestBid]);

  const handleBidAmountChange = (event) => {
    // Convert from ETH to wei (1 ETH = 10^18 wei)
    const ethValue = parseFloat(event.target.value) || 0;
    setCurrBidAmount(ethValue * Math.pow(10, 18));
  };

  const submitBid = async () => {
    if (currBidAmount <= 0) {
      enqueueSnackbar('Please enter a valid bid amount', { variant: 'error' });
      return;
    }
    // User bid amount is lower than highestBid or less than increment
    if (currBidAmount < highestBid) {
      enqueueSnackbar('Bid amount is lower than highest bid', {
        variant: 'error',
      });
      return;
    } else if (
      currBidAmount - highestBid < auctionData.increment &&
      accounts[0] !== auctionData.highestBidder
    ) {
      enqueueSnackbar(
        'Bid amount should be greater than highest bid + increment!',
        { variant: 'warning' }
      );
      return;
    } else {
      let sendAmount = currBidAmount - auctionData.userBidAmount;
      console.log(currBidAmount, auctionData.userBidAmount, sendAmount);
      const auctionContract = auctionData.auctionContract;
      try {
        console.log(`sending amount = ${sendAmount}`);
        await auctionContract.methods
          .bid()
          .send({ from: accounts[0], value: sendAmount });
        enqueueSnackbar('Successfully submitted bid!', { variant: 'success' });
        auctionData.userBidAmount = currBidAmount;
        setRole('highestBidder');
        console.log(auctionData.userBidAmount);
      } catch (err) {
        enqueueSnackbar(getRPCErrorMessage(err), { variant: 'error' });
      }
    }
  };

  const handleApproveNFT = async () => {
    if (!web3 || !accounts || accounts.length === 0) {
      enqueueSnackbar('Please connect your wallet', { variant: 'error' });
      return;
    }

    try {
      const mintNftJson = require('../contracts/MintNFT.json');
      const mintNftContract = new web3.eth.Contract(
        mintNftJson.abi,
        auctionData.nft
      );
      const auctionAddress = auctionData.auctionContract._address;
      
      enqueueSnackbar('Approving NFT...', { variant: 'info' });
      await mintNftContract.methods
        .approve(auctionAddress, auctionData.nftId)
        .send({ from: accounts[0] });
      
      setIsApproved(true);
      enqueueSnackbar('NFT approved successfully! You can now start the auction.', {
        variant: 'success',
      });
    } catch (err) {
      const errorMsg = getRPCErrorMessage(err);
      enqueueSnackbar(`Approval failed: ${errorMsg}`, { variant: 'error' });
    }
  };

  const handleStartAuction = async () => {
    if (auctionData.started) {
      enqueueSnackbar('Auction already started!', { variant: 'error' });
      return;
    }
    const auctionContract = auctionData.auctionContract;
    const auctionAddress = auctionContract._address;
    
    // Check if NFT is approved before attempting to start
    try {
      if (!web3) {
        throw new Error('Web3 not available');
      }
      const mintNftJson = require('../contracts/MintNFT.json');
      const mintNftContract = new web3.eth.Contract(
        mintNftJson.abi,
        auctionData.nft
      );
      const approvedAddress = await mintNftContract.methods
        .getApproved(auctionData.nftId)
        .call();
      
      if (approvedAddress.toLowerCase() !== auctionAddress.toLowerCase()) {
        enqueueSnackbar(
          `NFT must be approved first! Auction address: ${auctionAddress.slice(0, 8)}...${auctionAddress.slice(-6)}. Copy this address and approve the NFT (Token ID: ${auctionData.nftId}) for this auction.`,
          { variant: 'warning', autoHideDuration: 8000 }
        );
        // Copy auction address to clipboard
        navigator.clipboard.writeText(auctionAddress).catch(() => {});
        return;
      }
    } catch (checkErr) {
      console.warn('Could not check approval status:', checkErr);
      // Continue anyway, let the contract revert if not approved
    }
    
    try {
      await auctionContract.methods.start().send({ from: accounts[0] });
      enqueueSnackbar('Auction Successfully Started', { variant: 'success' });
      console.log('auction started :D');
      refetchData();
    } catch (err) {
      const errorMsg = getRPCErrorMessage(err);
      // Check if error is about approval/transfer
      if (errorMsg.toLowerCase().includes('transfer') || 
          errorMsg.toLowerCase().includes('approve') ||
          errorMsg.toLowerCase().includes('erc721') ||
          errorMsg.toLowerCase().includes('not approved') ||
          err.code === -32603) {
        enqueueSnackbar(
          `❌ Failed to start: NFT (Token ID: ${auctionData.nftId}) must be approved for auction ${auctionAddress.slice(0, 8)}...${auctionAddress.slice(-6)} first!`,
          { variant: 'error', autoHideDuration: 8000 }
        );
        // Copy auction address to clipboard for easy approval
        navigator.clipboard.writeText(auctionAddress).then(() => {
          enqueueSnackbar('Auction address copied to clipboard', { variant: 'info' });
        }).catch(() => {});
      } else {
        enqueueSnackbar(errorMsg || 'Failed to start auction', { variant: 'error' });
      }
    }
  };

  const handleWithdraw = async () => {
    // highest bidder cannot withdraw
    if (highestBidder === accounts[0]) {
      enqueueSnackbar('You are the highest bidder! You cannot withdraw!', {
        variant: 'error',
      });
      return;
    }
    if (highestBidder === '0x0000000000000000000000000000000000000000') {
      enqueueSnackbar('No one has placed any bid yet!', {
        variant: 'error',
      });
      return;
    }
    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.withdraw().send({ from: accounts[0] });
      enqueueSnackbar('Successfully withdrew your bid amount', {
        variant: 'success',
      });
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: 'error' });
    }
  };

  const handleEnd = async () => {
    if (auctionData.ended) {
      enqueueSnackbar('Auction already ended!', { variant: 'error' });
      return;
    }
    if (
      accounts[0] !== auctionData.seller &&
      accounts[0] !== auctionData.highestBidder
    ) {
      enqueueSnackbar('You are not the seller nor highest bidder', {
        variant: 'error',
      });
      return;
    }
    if (auctionData.endAt > Math.floor(Date.now() / 1000)) {
      enqueueSnackbar('Auction is not over yet', { variant: 'error' });
      return;
    }
    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.end().send({ from: accounts[0] });
      enqueueSnackbar('Successfully ended the auction!', {
        variant: 'success',
      });
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: 'error' });
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpen}
        variant="contained"
        color="primary"
        size="medium"
      >
        View Details
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box display="flex" justifyContent={'space-between'} alignItems="center" sx={{ mb: 2 }}>
            <Button 
              onClick={() => logAuctionData(auctionData)}
              size="small"
              variant="text"
              color="inherit"
            >
              Debug
            </Button>
            <Button 
              onClick={handleClose}
              variant="outlined"
              size="small"
            >
              Close
            </Button>
          </Box>
          <Box
            sx={{
              marginLeft: '14px',
            }}
          >
            <Typography id="modal-modal-title" variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
              {pinataMetadata?.name ?? 'Unnamed NFT'}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Highest Bid
            </Typography>
              <Chip
                label={`${displayInEth(highestBid)} ETH`}
                color="primary"
                size="medium"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time Remaining
            </Typography>
              {auctionData.ended ? (
                <Typography variant="body1" color="error" fontStyle="italic">
                  Auction has already ended
                </Typography>
              ) : auctionData.started ? (
                <CountdownTimer
                  initialHour={timeTillExpiryHours}
                  initialMinute={timeTillExpiryMinutes}
                  initialSecond={timeTillExpirySeconds}
                />
              ) : (
                <Typography variant="body1" color="text.secondary" fontStyle="italic">
                  Auction has not yet started
            </Typography>
              )}
            </Box>
            <MuiDivider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="10px"
              >
                {role === 'seller' && (
                  <>
                     {!auctionData.started && !isApproved && (
                       <Box 
                         display="flex" 
                         flexDirection="column" 
                         alignItems="center" 
                         gap={2}
                         sx={{
                           p: 2,
                           borderRadius: 2,
                           bgcolor: 'warning.light',
                           width: '100%',
                           mb: 2,
                         }}
                       >
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <WarningIcon color="warning" />
                           <Typography variant="body2" fontWeight="medium">
                             NFT must be approved before starting auction
                           </Typography>
                         </Box>
                         <Button
                           variant="contained"
                           color="warning"
                           onClick={handleApproveNFT}
                           disabled={checkingApproval}
                           size="large"
                           startIcon={checkingApproval ? null : <CheckCircleIcon />}
                         >
                           {checkingApproval ? 'Checking...' : 'Approve NFT'}
                         </Button>
                       </Box>
                     )}
                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                       <Button
                         variant="contained"
                         color="primary"
                         onClick={handleStartAuction}
                         disabled={!auctionData.started && !isApproved}
                         size="large"
                         startIcon={<PlayArrowIcon />}
                       >
                         Start Auction
                       </Button>
                       <Button 
                         variant="outlined" 
                         color="error"
                         onClick={handleEnd}
                         size="large"
                         startIcon={<StopIcon />}
                       >
                         End Auction
                    </Button>
                     </Box>
                  </>
                )}
                {(role === 'notBidder' || role === 'bidder') && (
                  <Box display="flex" gap={1} sx={{ width: '100%', maxWidth: 400 }}>
                    <TextField
                      id="modal-bid"
                      label="Bid Amount (ETH)"
                      type="number"
                      variant="outlined"
                      required
                      min={0}
                      step="0.0001"
                      fullWidth
                      onChange={handleBidAmountChange}
                      helperText={
                        highestBid && auctionData.increment
                          ? `Minimum: ${displayInEth(Number(highestBid) + Number(auctionData.increment))} ETH`
                          : 'Enter your bid amount in ETH'
                      }
                    />
                    <Button 
                      variant="contained" 
                      onClick={submitBid}
                      size="large"
                      sx={{ minWidth: 120 }}
                    >
                      Submit Bid
                    </Button>
                  </Box>
                )}

                {role === 'bidder' && (
                  <Box sx={{ mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={handleWithdraw}
                      size="medium"
                    >
                      Withdraw Bid
                      </Button>
                  </Box>
                )}

                {role === 'highestBidder' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      🎉 You are the highest bidder!
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={handleEnd}
                      size="large"
                      startIcon={<StopIcon />}
                    >
                      End Auction
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default NFTListingBidModal;
