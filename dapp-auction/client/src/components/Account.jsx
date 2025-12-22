import {
  Card,
  Box,
  Grid,
  Typography,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectionsIcon from '@mui/icons-material/Collections';
import GavelIcon from '@mui/icons-material/Gavel';
import SendIcon from '@mui/icons-material/Send';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { useSnackbar } from 'notistack';
import { useNavigate, Link } from 'react-router-dom';
import {
  displayInGwei,
  displayInEth,
  displayInHours,
  displayTimestampInHumanReadable,
  resolveIpfsUri,
} from '../utils';

import MintNftForm from './MintNftForm';
import TransferNftModal from './TransferNftModal';

function Account({ auctions }) {
  const navigate = useNavigate();
  const [latestAuction, setLatestAuction] = useState();
  const [ethBalance, setEthBalance] = useState(null);
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [myAuctionTab, setMyAuctionTab] = useState(0); // 0 = Selling, 1 = Bidding
  const {
    state: { accounts, web3, networkID },
  } = useEth();
  const { enqueueSnackbar } = useSnackbar();

  const handleAuctionClick = (auctionAddress) => {
    navigate(`/auctions#${auctionAddress}`);
    // Scroll to auction after navigation
    setTimeout(() => {
      const element = document.getElementById(auctionAddress);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  useEffect(() => {
    if (!web3 || !accounts || accounts.length === 0) return;

    let cancelled = false;

    const loadBalance = async () => {
      try {
        const balWei = await web3.eth.getBalance(accounts[0]);
        if (!cancelled) {
          // web3.utils.fromWei trả về string ETH
          const balEth = web3.utils.fromWei(balWei, 'ether');
          setEthBalance(balEth);
        }
      } catch (e) {
        console.error('[Account] Failed to load balance', e);
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [web3, accounts]);

  useEffect(() => {
    if (!auctions || !accounts || accounts.length === 0) {
      setLatestAuction(undefined);
      return;
    }

    // Lọc tất cả auction mà user là seller, lấy auction mới nhất (cuối mảng)
    const selling = auctions.filter((a) => a.seller === accounts[0]);
    if (selling.length > 0) {
      setLatestAuction(selling[selling.length - 1]);
    } else {
      setLatestAuction(undefined);
    }
  }, [auctions, accounts]);

  const sellingAuctions = useMemo(() => {
    if (!auctions || !accounts || accounts.length === 0) return [];
    return auctions.filter((a) => a.seller === accounts[0]);
  }, [auctions, accounts]);

  const biddingAuctions = useMemo(() => {
    if (!auctions || !accounts || accounts.length === 0) return [];
    return auctions.filter(
      (a) => a.userBidAmount > 0 || a.highestBidder === accounts[0]
    );
  }, [auctions, accounts]);

  // My Collection - scan MintNFT tokens owned by current account
  const loadOwnedNfts = useCallback(async (cancelledRef) => {
      if (!web3 || !accounts || accounts.length === 0 || !networkID) {
        if (!cancelledRef?.current) {
          setOwnedNfts([]);
        }
        return;
      }
      try {
        const mintNftJson = require('../contracts/MintNFT.json');
        const deployed = mintNftJson.networks?.[networkID];
        if (!deployed?.address) {
          console.warn('[Account] MintNFT not deployed on this networkID', networkID);
          if (!cancelledRef?.current) {
            setOwnedNfts([]);
          }
          return;
        }
        const mintNftAddress = deployed.address;
        const mintNftContract = new web3.eth.Contract(
          mintNftJson.abi,
          mintNftAddress
        );

        const totalSupply = await mintNftContract.methods
          .totalSupply()
          .call();

        if (cancelledRef?.current) return;

        const owned = [];
        for (let tokenId = 1; tokenId <= parseInt(totalSupply); tokenId++) {
          if (cancelledRef?.current) break;
          
          try {
            const owner = await mintNftContract.methods
              .ownerOf(tokenId)
              .call();
            if (owner.toLowerCase() === accounts[0].toLowerCase()) {
              const tokenUriRaw = await mintNftContract.methods
                .tokenURI(tokenId)
                .call();
              let tokenUri = tokenUriRaw;
              let metadata = null;
              try {
                tokenUri = resolveIpfsUri(tokenUriRaw);
                const res = await fetch(tokenUri);
                const text = await res.text();
                if (cancelledRef?.current) break;
                
                try {
                  metadata = JSON.parse(text);
                } catch {
                  // tokenURI trỏ thẳng tới ảnh → tạo metadata tối thiểu
                  metadata = {
                    name: `Token #${tokenId}`,
                    description: "",
                    image: tokenUri,
                  };
                }
              } catch (e) {
                console.warn(
                  '[Account] Failed to fetch metadata for token',
                  tokenId,
                  e
                );
              }
              if (!cancelledRef?.current) {
                owned.push({
                  tokenId,
                  tokenUri,
                  metadata,
                  nftAddress: mintNftAddress,
                });
              }
            }
          } catch (e) {
            // token may not exist, skip
            continue;
          }
        }
        if (!cancelledRef?.current) {
          setOwnedNfts(owned);
        }
      } catch (e) {
        console.error('[Account] Failed to load owned NFTs', e);
        if (!cancelledRef?.current) {
          setOwnedNfts([]);
        }
      }
  }, [web3, networkID, accounts]);

  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    const cancelledRef = { current: false };
    loadOwnedNfts(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [loadOwnedNfts, reloadTrigger]);

  // Reload NFTs when account changes (MetaMask connection)
  const currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;
  useEffect(() => {
    if (currentAccount) {
      setReloadTrigger(prev => prev + 1);
    }
  }, [currentAccount]); // Watch first account change

  return (
    <Card
      sx={{
        background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
        border: 'none',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#33C2FF' }} />
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                variant="h4"
              >
                My Wallet
              </Typography>
            </Box>
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Account</Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {accounts && accounts[0]
                    ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
                    : 'Not connected'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Network ID</Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {networkID !== null && networkID !== undefined
                    ? networkID
                    : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>ETH Balance</Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#33C2FF',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {ethBalance !== null ? `${ethBalance} ETH` : '...'}
                </Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(51, 194, 255, 0.2)' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 3 }}>
              <GavelIcon sx={{ fontSize: 28, color: '#33C2FF' }} />
            <Typography
              sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
              }}
              variant="h4"
            >
              Your Latest Auction
            </Typography>
            </Box>
            {latestAuction ? (
              <Box>
                <Typography
                  variant="h1"
                  gutterBottom
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {displayInEth(latestAuction.highestBid)} ETH 💰
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="normal"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}
                >
                  Current Highest Bid Amount{' '}
                  {latestAuction.highestBidder ===
                  '0x0000000000000000000000000000000000000000'
                    ? '(Your starting bid amount)'
                    : '(From ' +
                      latestAuction.highestBidder.slice(0, 8) +
                      '...)'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleAuctionClick(latestAuction.auctionContract._address)}
                  sx={{
                    mt: 2,
                    mb: 2,
                    background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                      boxShadow: '0 8px 32px rgba(51, 194, 255, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                    Go to Auction
                </Button>
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
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Title</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {latestAuction.pinataMetadata.name}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Auction Address</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {latestAuction.auctionContract._address.slice(0, 8)}...{latestAuction.auctionContract._address.slice(-6)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>NFT Address</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {latestAuction.nft.slice(0, 8)}...{latestAuction.nft.slice(-6)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Token ID</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {latestAuction.nftId}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Token Standard</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    ERC-721
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Minimal increment</Typography>
                    <Typography variant="h6" sx={{ color: '#33C2FF', fontWeight: 'bold' }}>
                      {displayInEth(latestAuction.increment)} ETH
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Start At</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {displayTimestampInHumanReadable(latestAuction.startAt)}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Duration</Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {displayInHours(latestAuction.duration)} hours
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
            sx={{
              p: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <MintNftForm onMinted={() => loadOwnedNfts()} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CollectionsIcon sx={{ fontSize: 28, color: '#33C2FF' }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  My Collection
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/collection"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#33C2FF',
                  color: '#33C2FF',
                  '&:hover': {
                    borderColor: '#123597',
                    bgcolor: 'rgba(51, 194, 255, 0.1)',
                  },
                }}
              >
                View All
              </Button>
            </Box>
            {ownedNfts.length === 0 ? (
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                You do not own any NFTs from this collection yet.
              </Typography>
            ) : (
              <List
                dense
                sx={{
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                {ownedNfts.map((nft) => {
                  const m = nft.metadata || {};
                  const rawImg =
                    m.image ||
                    m.image_url ||
                    m.imageUrl ||
                    m.animation_url ||
                    m.thumbnail ||
                    null;
                  const imgSrc = rawImg ? resolveIpfsUri(rawImg) : null;
                  const addr = nft.nftAddress;
                  const addrShort =
                    addr && addr.length > 10
                      ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
                      : addr || '';
                  const handleCopy = async (label, value) => {
                    try {
                      await navigator.clipboard.writeText(String(value));
                      enqueueSnackbar(`${label} copied`, { variant: 'success' });
                    } catch (e) {
                      enqueueSnackbar(`Failed to copy ${label}`, {
                        variant: 'error',
                      });
                    }
                  };

                  const handleImportToMetaMask = async (nft) => {
                    if (!window.ethereum) {
                      enqueueSnackbar('MetaMask is not installed', { variant: 'error' });
                      return;
                    }

                    try {
                      // Import NFT to MetaMask using wallet_watchAsset
                      const wasAdded = await window.ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                          type: 'ERC721',
                          options: {
                            address: nft.nftAddress,
                            tokenId: nft.tokenId.toString(),
                          },
                        },
                      });

                      if (wasAdded) {
                        enqueueSnackbar(
                          `NFT "${nft.metadata?.name || `Token #${nft.tokenId}`}" added to MetaMask`,
                          { variant: 'success' }
                        );
                      } else {
                        enqueueSnackbar('NFT was not added to MetaMask', { variant: 'info' });
                      }
                    } catch (error) {
                      console.error('[Account] Failed to import NFT to MetaMask:', error);
                      enqueueSnackbar('Failed to import NFT to MetaMask', { variant: 'error' });
                    }
                  };

                  return (
                    <ListItem key={nft.tokenId}>
                      {imgSrc && (
                        <Avatar
                          src={imgSrc}
                          alt={m.name || `Token #${nft.tokenId}`}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        />
                      )}
                      <ListItemText
                        primary={
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                            {m.name || `Token #${nft.tokenId}`}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                              {m.description || ' '}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                              >
                                Token ID: {nft.tokenId}
                                {addrShort && ` · NFT: ${addrShort}`}
                              </Typography>
                              <Tooltip title="Copy Token ID">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopy('Token ID', nft.tokenId)
                                  }
                                  color="primary"
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {addr && (
                                <Tooltip title="Copy NFT address">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleCopy('NFT address', addr)
                                    }
                                    color="primary"
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Import to MetaMask">
                                <IconButton
                                  size="small"
                                  onClick={() => handleImportToMetaMask(nft)}
                                  color="primary"
                                >
                                  <AddToPhotosIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Transfer NFT">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedNft(nft);
                                    setTransferModalOpen(true);
                                  }}
                                  color="secondary"
                                >
                                  <SendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {selectedNft && (
              <TransferNftModal
                nft={selectedNft}
                open={transferModalOpen}
                onClose={() => {
                  setTransferModalOpen(false);
                  setSelectedNft(null);
                }}
                onSuccess={() => {
                  loadOwnedNfts();
                }}
              />
            )}

            <Divider sx={{ my: 2, borderColor: 'rgba(51, 194, 255, 0.2)' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GavelIcon sx={{ fontSize: 28, color: '#33C2FF' }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                My Auctions
              </Typography>
            </Box>
            <Tabs
              value={myAuctionTab}
              onChange={(_, v) => setMyAuctionTab(v)}
              variant="fullWidth"
              sx={{
                mb: 1,
                borderBottom: '1px solid rgba(51, 194, 255, 0.2)',
                '& .MuiTab-root': {
                  color: 'white',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  minHeight: 48,
                  padding: '12px 16px',
                  '&:hover': {
                    color: 'white',
                  },
                  '&.Mui-selected': {
                    color: '#33C2FF',
                    fontWeight: 'bold',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#33C2FF',
                  height: 2,
                  zIndex: 0,
                },
              }}
            >
              <Tab 
                label={`Selling (${sellingAuctions.length})`}
                sx={{
                  color: myAuctionTab === 0 ? '#33C2FF' : 'white',
                  fontWeight: myAuctionTab === 0 ? 'bold' : 'medium',
                  zIndex: 1,
                  position: 'relative',
                }}
              />
              <Tab 
                label={`Bidding (${biddingAuctions.length})`}
                sx={{
                  color: myAuctionTab === 1 ? '#33C2FF' : 'white',
                  fontWeight: myAuctionTab === 1 ? 'bold' : 'medium',
                  zIndex: 1,
                  position: 'relative',
                }}
              />
            </Tabs>

            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
              {myAuctionTab === 0 &&
                (sellingAuctions.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    You are not selling any NFT at the moment.
                  </Typography>
                ) : (
                  <List dense>
                    {sellingAuctions.map((a) => (
                      <ListItem
                        key={a.auctionContract._address}
                        onClick={() => handleAuctionClick(a.auctionContract._address)}
                        sx={{
                          cursor: 'pointer',
                          background: 'rgba(51, 194, 255, 0.05)',
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid rgba(51, 194, 255, 0.1)',
                          '&:hover': {
                            background: 'rgba(51, 194, 255, 0.15)',
                            borderRadius: 2,
                            transform: 'translateX(4px)',
                            borderColor: 'rgba(51, 194, 255, 0.3)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {a.pinataMetadata?.name || 'Unnamed NFT'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={`Highest: ${displayInEth(a.highestBid)} ETH`}
                                size="small"
                                sx={{
                                  borderColor: '#33C2FF',
                                  color: '#33C2FF',
                                  fontWeight: 'bold',
                                  '& .MuiChip-label': {
                                    color: '#33C2FF',
                                  },
                                }}
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ))}

              {myAuctionTab === 1 &&
                (biddingAuctions.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    You have not placed any bids yet.
                  </Typography>
                ) : (
                  <List dense>
                    {biddingAuctions.map((a) => (
                      <ListItem
                        key={a.auctionContract._address}
                        onClick={() => handleAuctionClick(a.auctionContract._address)}
                        sx={{
                          cursor: 'pointer',
                          background: 'rgba(51, 194, 255, 0.05)',
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid rgba(51, 194, 255, 0.1)',
                          '&:hover': {
                            background: 'rgba(51, 194, 255, 0.15)',
                            borderRadius: 2,
                            transform: 'translateX(4px)',
                            borderColor: 'rgba(51, 194, 255, 0.3)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {a.pinataMetadata?.name || 'Unnamed NFT'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={`My bid: ${displayInEth(a.userBidAmount)} ETH`}
                                size="small"
                                sx={{
                                  borderColor: '#FF6B6B',
                                  color: '#FF6B6B',
                                  fontWeight: 'bold',
                                  '& .MuiChip-label': {
                                    color: '#FF6B6B',
                                  },
                                }}
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ))}
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

export default Account;
