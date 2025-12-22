import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { useSnackbar } from 'notistack';
const NftApprovalCard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();
  const nftJson = require('../contracts/MintNFT.json');
  const [vars, setVars] = useState({
    auctionAddress: '',
    nftId: '', //token id,
  });

  const handleAddressInput = (event) => {
    setVars({
      ...vars,
      auctionAddress: event.target.value,
    });
  };

  const handleNftIdInput = (event) => {
    setVars({
      ...vars,
      nftId: event.target.value,
    });
  };

  const handleApproval = async () => {
    const auctionAddress = vars.auctionAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(auctionAddress)) {
      enqueueSnackbar('Invalid auction address', { variant: 'error' });
      return;
    }
    const tid = parseInt(vars.nftId);
    if (Number.isNaN(tid) || tid < 0) {
      enqueueSnackbar('Invalid token id', { variant: 'error' });
      return;
    }

    let nftAddress = nftJson.networks[networkID].address;
    let nftContract = new web3.eth.Contract(nftJson.abi, nftAddress);
    try {
      await nftContract.methods
        .approve(vars.auctionAddress, tid)
        .send({ from: accounts[0] });
      enqueueSnackbar('Approval successful', {
        variant: 'success',
      });
    } catch (err) {
      console.log(err);
      enqueueSnackbar('Approval failed', {
        variant: 'error',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="div">
          Approve Auction Contract for NFT
        </Typography>
        <Typography variant="body1">
          Enter the auction contract address and the NFT token id which you want
          to allow the auction to make changes to.
        </Typography>
        <form className="nft-approval-form">
          <TextField
            placeholder="Auction Address"
            name="auctionAddress"
            value={vars.auctionAddress}
            onChange={handleAddressInput}
            margin="normal"
            required
            label="Auction Address"
            id="auctionAddress"
          />
          <TextField
            margin="normal"
            required
            label="NFT Token ID"
            id="nftTokenId"
            placeholder="NFT token ID"
            name="tokenId"
            value={vars.nftId}
            onChange={handleNftIdInput}
            type="number"
          />
        </form>
        <Button onClick={handleApproval} variant="outlined">
          Set Approve
        </Button>
      </CardContent>
    </Card>
  );
};

export default NftApprovalCard;
