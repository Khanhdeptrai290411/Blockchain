import { Card, Box, Grid, Typography, Divider, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { useEth } from '../contexts/EthContext';
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
} from '../utils';
import NftApprovalCard from './NftApprovalCard';

function Account({ auctions }) {
  const [auction, setAuction] = useState();
  const {
    state: { accounts },
  } = useEth();

  useEffect(() => {
    if (auctions !== undefined && auctions.length > 0) {
      for (let i = 0; i < auctions.length; i++) {
        if (auctions[i].seller === accounts[0]) {
          setAuction(auctions[i]);
        }
      }
    }
  }, [auctions, accounts]);

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <Typography
              sx={{
                pb: 3,
              }}
              variant="h4"
            >
              Your Latest Auction
            </Typography>
            {auction ? (
              <Box>
                <Typography variant="h1" gutterBottom>
                  {displayInGwei(auction.highestBid)} gwei 💰
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="normal"
                  color="text.secondary"
                >
                  Current Highest Bid Amount{' '}
                  {auction.highestBidder ===
                  '0x0000000000000000000000000000000000000000'
                    ? '(Your starting bid amount)'
                    : '(From ' + auction.highestBidder.slice(0, 8) + '...)'}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ marginTop: '10px', marginBottom: '10px' }}
                >
                  <a href={`#${auction.auctionContract._address}`}>
                    Go to Auction
                  </a>
                </Typography>
                <Box
                  display="flex"
                  sx={{
                    flexDirection: 'column',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Title</Typography>
                    {auction.pinataMetadata.name}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Auction Address</Typography>
                    {auction.auctionContract._address}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">NFT Address</Typography>
                    {auction.nft}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Token ID</Typography>
                    {auction.nftId}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Token Standard</Typography>
                    ERC-721
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Minimal increment</Typography>
                    {displayInGwei(auction.increment)} gwei
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Start At</Typography>
                    {displayTimestampInHumanReadable(auction.startAt)}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Duration</Typography>
                    {displayInHours(auction.duration)} hours
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Typography variant="h3">
                You have not created any auctions yet...
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid
          sx={{
            position: 'relative',
          }}
          display="flex"
          alignItems="center"
          item
          xs={12}
          md={6}
        >
          <Box
            component="span"
            sx={{
              display: { xs: 'none', md: 'inline-block' },
            }}
          >
            <Divider absolute orientation="vertical" />
          </Box>
          <NftApprovalCard />
        </Grid>
      </Grid>
    </Card>
  );
}

export default Account;
