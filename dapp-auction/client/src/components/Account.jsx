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
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import { useSnackbar } from 'notistack';
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
  resolveIpfsUri,
} from '../utils';

import MintNftForm from './MintNftForm';

function Account({ auctions }) {
  const [latestAuction, setLatestAuction] = useState();
  const [ethBalance, setEthBalance] = useState(null);
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [myAuctionTab, setMyAuctionTab] = useState(0); // 0 = Selling, 1 = Bidding
  const {
    state: { accounts, web3, networkID },
  } = useEth();
  const { enqueueSnackbar } = useSnackbar();

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
  const loadOwnedNfts = useCallback(async () => {
      if (!web3 || !accounts || accounts.length === 0 || !networkID) {
        setOwnedNfts([]);
        return;
      }
      try {
        const mintNftJson = require('../contracts/MintNFT.json');
        const deployed = mintNftJson.networks?.[networkID];
        if (!deployed?.address) {
          console.warn('[Account] MintNFT not deployed on this networkID', networkID);
          setOwnedNfts([]);
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

        const owned = [];
        for (let tokenId = 1; tokenId <= parseInt(totalSupply); tokenId++) {
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
              owned.push({
                tokenId,
                tokenUri,
                metadata,
                nftAddress: mintNftAddress,
              });
            }
          } catch (e) {
            // token may not exist, skip
            continue;
          }
        }
        setOwnedNfts(owned);
      } catch (e) {
        console.error('[Account] Failed to load owned NFTs', e);
        setOwnedNfts([]);
      }
  }, [web3, networkID, accounts]);

  useEffect(() => {
    loadOwnedNfts();
  }, [loadOwnedNfts]);

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <Typography
              sx={{
                pb: 2,
              }}
              variant="h4"
            >
              Ví của tôi
            </Typography>
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Account</Typography>
                <Typography variant="h6">
                  {accounts && accounts[0]
                    ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
                    : 'Not connected'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Network ID</Typography>
                <Typography variant="h6">
                  {networkID !== null && networkID !== undefined
                    ? networkID
                    : '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">ETH Balance</Typography>
                <Typography variant="h6">
                  {ethBalance !== null ? `${ethBalance} ETH` : '...'}
                </Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography
              sx={{
                pb: 3,
              }}
              variant="h4"
            >
              Your Latest Auction
            </Typography>
            {latestAuction ? (
              <Box>
                <Typography variant="h1" gutterBottom>
                  {displayInGwei(latestAuction.highestBid)} gwei 💰
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="normal"
                  color="text.secondary"
                >
                  Current Highest Bid Amount{' '}
                  {latestAuction.highestBidder ===
                  '0x0000000000000000000000000000000000000000'
                    ? '(Your starting bid amount)'
                    : '(From ' +
                      latestAuction.highestBidder.slice(0, 8) +
                      '...)'}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ marginTop: '10px', marginBottom: '10px' }}
                >
                  <a href={`#${latestAuction.auctionContract._address}`}>
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
                    {latestAuction.pinataMetadata.name}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Auction Address</Typography>
                    {latestAuction.auctionContract._address}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">NFT Address</Typography>
                    {latestAuction.nft}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Token ID</Typography>
                    {latestAuction.nftId}
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
                    {displayInGwei(latestAuction.increment)} gwei
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Start At</Typography>
                    {displayTimestampInHumanReadable(latestAuction.startAt)}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="h4">Duration</Typography>
                    {displayInHours(latestAuction.duration)} hours
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
            sx={{
              p: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <MintNftForm onMinted={() => loadOwnedNfts()} />

            <Typography variant="h4" sx={{ mb: 1 }}>
              My Collection
            </Typography>
            {ownedNfts.length === 0 ? (
              <Typography variant="body1">
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
                        primary={m.name || `Token #${nft.tokenId}`}
                        secondary={
                          <>
                            <Typography variant="body2">
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
                                color="textSecondary"
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
                                >
                                  <span>📋</span>
                                </IconButton>
                              </Tooltip>
                              {addr && (
                                <Tooltip title="Copy NFT address">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleCopy('NFT address', addr)
                                    }
                                  >
                                    <span>🔗</span>
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h4" sx={{ mb: 1 }}>
              My Auctions
            </Typography>
            <Tabs
              value={myAuctionTab}
              onChange={(_, v) => setMyAuctionTab(v)}
              variant="fullWidth"
              sx={{ mb: 1 }}
            >
              <Tab label={`Selling (${sellingAuctions.length})`} />
              <Tab label={`Bidding (${biddingAuctions.length})`} />
            </Tabs>

            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
              {myAuctionTab === 0 &&
                (sellingAuctions.length === 0 ? (
                  <Typography variant="body2">
                    You are not selling any NFT at the moment.
                  </Typography>
                ) : (
                  <List dense>
                    {sellingAuctions.map((a) => (
                      <ListItem
                        key={a.auctionContract._address}
                        component="a"
                        href={`#${a.auctionContract._address}`}
                      >
                        <ListItemText
                          primary={a.pinataMetadata.name}
                          secondary={`Highest: ${displayInGwei(
                            a.highestBid
                          )} gwei`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ))}

              {myAuctionTab === 1 &&
                (biddingAuctions.length === 0 ? (
                  <Typography variant="body2">
                    You have not placed any bids yet.
                  </Typography>
                ) : (
                  <List dense>
                    {biddingAuctions.map((a) => (
                      <ListItem
                        key={a.auctionContract._address}
                        component="a"
                        href={`#${a.auctionContract._address}`}
                      >
                        <ListItemText
                          primary={a.pinataMetadata.name}
                          secondary={`My bid: ${displayInGwei(
                            a.userBidAmount
                          )} gwei`}
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
