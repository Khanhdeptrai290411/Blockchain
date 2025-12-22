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
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEth } from '../contexts/EthContext';
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
  resolveIpfsUri,
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
  padding: ${theme.spacing(3)};
  margin-bottom: ${theme.spacing(2)};
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
  const meta = pinataMetadata || {};
  const rawImg =
    meta.image ||
    meta.image_url ||
    meta.imageUrl ||
    meta.animation_url ||
    meta.thumbnail ||
    null;
  const imgSrc = rawImg ? resolveIpfsUri(rawImg) : null;
  const {
    state: { accounts },
  } = useEth();
  return (
    <ListItemWrapper id={auction.auctionContract._address}>
      <ListItemAvatarWrapper sx={{ mr: 3 }}>
        {accounts[0] === auction.seller && (
          <Chip
            label="My Auction"
            color="primary"
            size="small"
            sx={{ mb: 1, fontWeight: 'bold' }}
            icon={<AccountCircleIcon />}
          />
        )}
        {imgSrc && (
          <img alt="img" src={imgSrc} width={450} height={450} />
        )}
      </ListItemAvatarWrapper>
        <Box display="flex" flexDirection="column" sx={{ width: '100%', pl: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {meta.name ?? 'Unnamed NFT'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {meta.description ?? 'No description'}
        </Typography>
        <Tooltip title={auction.seller} arrow>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Owner: {auction.seller.slice(0, 8)}...{auction.seller.slice(-6)}
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
            gap: 1.5,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography fontWeight="medium">Highest Bid</Typography>
            <Chip
              label={`${displayInGwei(auction.highestBid)} gwei`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
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
            sx={{ py: 0.5 }}
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
            sx={{ py: 0.5 }}
          >
            <Typography>Token ID</Typography>
            {auction.nftId}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography>Token Standard</Typography>
            ERC-721
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography>Minimal increment</Typography>
            {displayInGwei(auction.increment)} gwei
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography>Start At</Typography>
            {displayTimestampInHumanReadable(auction.startAt)}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography>Duration</Typography>
            {displayInHours(auction.duration)} hours
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography>Status</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={auction.started ? 'Started' : 'Not Started'}
                color={auction.started ? 'success' : 'default'}
                size="small"
                icon={auction.started ? <CheckCircleIcon /> : <CancelIcon />}
              />
              {auction.ended && (
                <Chip
                  label="Ended"
                  color="error"
                  size="small"
                  icon={<CancelIcon />}
                />
              )}
            </Box>
          </Stack>
          <Box sx={{ mt: 2 }}>
            <NFTListingBidModal
              pinataMetadata={pinataMetadata}
              auctionData={auction}
              refetchData={refetchData}
            />
          </Box>
        </Box>
      </Box>
    </ListItemWrapper>
  );
}

export default AuctionDetails;
