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
  displayInEth,
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
  background: linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%);
  border: none;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: ${theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  })};
  &:hover {
    background: linear-gradient(145deg, rgba(26, 31, 46, 0.95) 0%, rgba(11, 14, 17, 0.95) 100%);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(51, 194, 255, 0.2);
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
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            color: 'white',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {meta.name ?? 'Unnamed NFT'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          {meta.description ?? 'No description'}
        </Typography>
        <Tooltip title={auction.seller} arrow>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)' }}>
            Owner: {auction.seller.slice(0, 8)}...{auction.seller.slice(-6)}
          </Typography>
        </Tooltip>
        <Divider
          variant="middle"
          sx={{ marginTop: '10px', marginBottom: '10px', borderColor: 'rgba(51, 194, 255, 0.2)' }}
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
            <Typography fontWeight="medium" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Highest Bid</Typography>
            <Chip
              label={`${displayInEth(auction.highestBid)} ETH`}
              sx={{
                borderColor: '#33C2FF',
                color: '#33C2FF',
                fontWeight: 'bold',
                '& .MuiChip-label': {
                  color: '#33C2FF',
                },
              }}
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
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Auction Address</Typography>
            <Tooltip title={auction.auctionContract._address} arrow>
              <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
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
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>NFT Address</Typography>
            <Tooltip title={auction.nft} arrow>
              <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{auction.nft.slice(0, 8) + '...'}</Typography>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Token ID</Typography>
            <Typography sx={{ color: 'white', fontWeight: 'bold' }}>{auction.nftId}</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Token Standard</Typography>
            <Typography sx={{ color: 'white', fontWeight: 'bold' }}>ERC-721</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Minimal increment</Typography>
            <Typography sx={{ color: '#33C2FF', fontWeight: 'bold' }}>{displayInEth(auction.increment)} ETH</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Start At</Typography>
            <Typography sx={{ color: 'white', fontWeight: 'bold' }}>{displayTimestampInHumanReadable(auction.startAt)}</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Duration</Typography>
            <Typography sx={{ color: 'white', fontWeight: 'bold' }}>{displayInHours(auction.duration)} hours</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ py: 0.5 }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Status</Typography>
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
