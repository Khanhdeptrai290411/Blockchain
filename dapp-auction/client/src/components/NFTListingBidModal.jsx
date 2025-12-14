import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { displayInGwei } from '../utils';
import CountdownTimer from './CountdownTimer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
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
    state: { accounts },
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
    setCurrBidAmount(event.target.value * Math.pow(10, 9));
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

  const handleStartAuction = async () => {
    if (auctionData.started) {
      enqueueSnackbar('Auction already started!', { variant: 'error' });
      return;
    }
    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.start().send({ from: accounts[0] });
      enqueueSnackbar('Auction Successfully Started', { variant: 'success' });
      console.log('auction started :D');
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: 'error' });
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
      <Button onClick={handleOpen}>Open</Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box display="flex" justifyContent={'space-between'}>
            <Button onClick={() => logAuctionData(auctionData)}>
              Debug auction in console
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </Box>
          <Box
            sx={{
              marginLeft: '14px',
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Title: {pinataMetadata.name}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Highest Bid: {displayInGwei(highestBid)} gwei
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Time Till Expiry:{' '}
              {auctionData.ended ? (
                <span>
                  <i>Auction has already ended</i>
                </span>
              ) : auctionData.started ? (
                <CountdownTimer
                  initialHour={timeTillExpiryHours}
                  initialMinute={timeTillExpiryMinutes}
                  initialSecond={timeTillExpirySeconds}
                />
              ) : (
                <span>
                  <i>Auction has not yet started</i>
                </span>
              )}
            </Typography>
            <hr />
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
                  <Typography>
                    As the seller, you can{' '}
                    <Button variant="contained" onClick={handleStartAuction}>
                      Start
                    </Button>{' '}
                    <Button variant="contained" onClick={handleEnd}>
                      End
                    </Button>
                  </Typography>
                )}
                {(role === 'notBidder' || role === 'bidder') && (
                  <Box display="flex">
                    <TextField
                      id="modal-bid"
                      label="My Bid (GWei)"
                      type="number"
                      variant="outlined"
                      required
                      min={0}
                      size="small"
                      onChange={handleBidAmountChange}
                    />
                    <Button variant="contained" onClick={submitBid}>
                      Submit Bid
                    </Button>
                  </Box>
                )}

                {role === 'bidder' && (
                  <Box display="flex">
                    <Typography>
                      No longer interested?{' '}
                      <Button variant="contained" onClick={handleWithdraw}>
                        {' '}
                        Withdraw{' '}
                      </Button>
                    </Typography>
                  </Box>
                )}

                {role === 'highestBidder' && (
                  <Typography>
                    As the highest bidder:{' '}
                    <Button variant="contained" onClick={handleEnd}>
                      End
                    </Button>
                  </Typography>
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
