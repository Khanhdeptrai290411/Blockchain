import {
  ListItem,
  styled,
  ListItemAvatar,
  alpha,
  Box,
  Typography,
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import { useEth } from '../contexts/EthContext';
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
} from '../utils';
import NFTListingBidModal from './NFTListingBidModal';

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing(1)};
  padding: ${theme.spacing(0.5)};
  border-radius: 5px;
  background: ${
    theme.palette.mode === 'dark'
      ? theme.colors.alpha.trueWhite[30]
      : alpha(theme.colors.alpha.black[100], 0.07)
  };
  img {
    background: ${theme.colors.alpha.trueWhite[100]};
    padding: ${theme.spacing(0.5)};
    display: block;
    border-radius: inherit;
    object-fit: contain;
  }
  
`
);

const ListItemWrapper = styled(ListItem)(
  ({ theme }) => `
  transition: ${theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.standard,
  })};
  &:hover {
    background-color: rgba(34, 51, 84, 0.07);
    transform: scale(1.01);
  }
`
);

function AuctionDetails({ auction, refetchData }) {
  const { pinataMetadata } = auction;
  const {
    state: { accounts },
  } = useEth();
  return (
    <ListItemWrapper id={auction.auctionContract._address}>
      <ListItemAvatarWrapper>
        {accounts[0] === auction.seller && (
          <Typography sx={{ fontWeight: 'bold' }}>✨My Auction✨</Typography>
        )}
        <img alt="img" src={pinataMetadata.image} width={450} height={450} />
      </ListItemAvatarWrapper>
      <Box display="flex" flexDirection="column" sx={{ width: '100%' }}>
        <Typography
          sx={{ fontWeight: 'bold' }}
        >{`Title: ${pinataMetadata.name}`}</Typography>
        <Typography
          sx={{ fontWeight: 'bold' }}
        >{`Description: ${pinataMetadata.description}`}</Typography>
        <Tooltip title={auction.seller} arrow>
          <Typography sx={{ fontWeight: 'bold' }}>
            {`Owned by: ${auction.seller.slice(0, 8)}...`}
          </Typography>
        </Tooltip>
        <Divider
          variant="middle"
          sx={{ marginTop: '10px', marginBottom: '10px' }}
        />
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
            <Typography>Highest Bid</Typography>
            {displayInGwei(auction.highestBid)} gwei
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Auction Address</Typography>
            <Tooltip title={auction.auctionContract._address} arrow>
              <Typography>
                {auction.auctionContract._address.slice(0, 8) + '...'}
              </Typography>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>NFT Address</Typography>
            <Tooltip title={auction.nft} arrow>
              <Typography>{auction.nft.slice(0, 8) + '...'}</Typography>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Token ID</Typography>
            {auction.nftId}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Token Standard</Typography>
            ERC-721
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Minimal increment</Typography>
            {displayInGwei(auction.increment)} gwei
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Start At</Typography>
            {displayTimestampInHumanReadable(auction.startAt)}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Duration</Typography>
            {displayInHours(auction.duration)} hours
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Auction Started</Typography>
            {auction.started ? 'Yes' : 'No'}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography>Auction Ended</Typography>
            {auction.ended ? 'Yes' : 'No'}
          </Stack>
          <NFTListingBidModal
            pinataMetadata={pinataMetadata}
            auctionData={auction}
            refetchData={refetchData}
          />
        </Box>
      </Box>
    </ListItemWrapper>
  );
}

export default AuctionDetails;
