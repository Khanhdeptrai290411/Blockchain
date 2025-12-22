import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, alpha, Fade, CircularProgress, Tabs, Tab } from '@mui/material';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEth } from '../contexts/EthContext';
import RootHeader from '../components/RootHeader';
import CollectionsIcon from '@mui/icons-material/Collections';
import { resolveIpfsUri, getAuctionFactoryContract, getAuctions } from '../utils';
import CreateAuctionFromNftModal from '../components/CreateAuctionFromNftModal';
import GavelIcon from '@mui/icons-material/Gavel';
import AlbumIcon from '@mui/icons-material/Album';

function Collection() {
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState(null);
  const [createAuctionOpen, setCreateAuctionOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = My Album, 1 = My Auction
  const {
    state: { accounts, web3, networkID },
  } = useEth();

  useEffect(() => {
    setChecked(true);
  }, []);

  const loadOwnedNfts = useCallback(async () => {
    if (!web3 || !accounts || accounts.length === 0 || !networkID) {
      setOwnedNfts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const mintNftJson = require('../contracts/MintNFT.json');
      const deployed = mintNftJson.networks?.[networkID];
      if (!deployed?.address) {
        console.warn('[Collection] MintNFT not deployed on this networkID', networkID);
        setOwnedNfts([]);
        setLoading(false);
        return;
      }
      const mintNftAddress = deployed.address;
      const mintNftContract = new web3.eth.Contract(
        mintNftJson.abi,
        mintNftAddress
      );

      const totalSupply = await mintNftContract.methods.totalSupply().call();
      const owned = [];
      
      for (let tokenId = 1; tokenId <= parseInt(totalSupply); tokenId++) {
        try {
          const owner = await mintNftContract.methods.ownerOf(tokenId).call();
          if (owner.toLowerCase() === accounts[0].toLowerCase()) {
            const tokenUriRaw = await mintNftContract.methods.tokenURI(tokenId).call();
            let tokenUri = tokenUriRaw;
            let metadata = null;
            try {
              tokenUri = resolveIpfsUri(tokenUriRaw);
              const res = await fetch(tokenUri);
              const text = await res.text();
              try {
                metadata = JSON.parse(text);
              } catch {
                metadata = {
                  name: `Token #${tokenId}`,
                  description: '',
                  image: tokenUri,
                };
              }
            } catch (e) {
              console.warn('[Collection] Failed to fetch metadata for token', tokenId, e);
            }
            owned.push({
              tokenId,
              tokenUri,
              metadata,
              nftAddress: mintNftAddress,
            });
          }
        } catch (e) {
          continue;
        }
      }
      setOwnedNfts(owned);
    } catch (e) {
      console.error('[Collection] Failed to load owned NFTs', e);
      setOwnedNfts([]);
    } finally {
      setLoading(false);
    }
  }, [web3, networkID, accounts]);

  // Load auctions to check which NFTs are in auction
  const loadAuctions = useCallback(async () => {
    if (!web3 || !networkID) return;
    try {
      const auctionFactoryContract = getAuctionFactoryContract(web3, networkID);
      if (auctionFactoryContract) {
        const auctionsData = await getAuctions(web3, auctionFactoryContract, accounts);
        setAuctions(auctionsData);
      }
    } catch (e) {
      console.error('[Collection] Failed to load auctions', e);
    }
  }, [web3, networkID, accounts]);

  useEffect(() => {
    loadOwnedNfts();
    loadAuctions();
  }, [loadOwnedNfts, loadAuctions]);

  // Separate NFTs into two categories
  const { myAlbumNfts, myAuctionNfts } = useMemo(() => {
    const album = [];
    const auction = [];

    ownedNfts.forEach((nft) => {
      // Check if this NFT is in any auction
      const isInAuction = auctions.some(
        (auction) =>
          auction.nft.toLowerCase() === nft.nftAddress.toLowerCase() &&
          auction.nftId === nft.tokenId &&
          auction.seller.toLowerCase() === accounts?.[0]?.toLowerCase()
      );

      if (isInAuction) {
        auction.push(nft);
      } else {
        album.push(nft);
      }
    });

    return { myAlbumNfts: album, myAuctionNfts: auction };
  }, [ownedNfts, auctions, accounts]);

  const handleCreateAuction = (nft) => {
    setSelectedNft(nft);
    setCreateAuctionOpen(true);
  };

  const handleCloseModal = () => {
    setCreateAuctionOpen(false);
    setSelectedNft(null);
  };

  const handleAuctionCreated = () => {
    loadOwnedNfts();
    loadAuctions();
    handleCloseModal();
  };

  const renderNftGrid = (nfts) => {
    if (nfts.length === 0) {
      return (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(51, 194, 255, 0.2)',
          }}
        >
          <CollectionsIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            {activeTab === 0 ? 'No NFTs in your album' : 'No NFTs in auction'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {activeTab === 0
              ? 'Create your first NFT to get started'
              : 'Create an auction for your NFTs'}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {nfts.map((nft) => {
          const m = nft.metadata || {};
          const rawImg =
            m.image ||
            m.image_url ||
            m.imageUrl ||
            m.animation_url ||
            m.thumbnail ||
            null;
          const imgSrc = rawImg ? resolveIpfsUri(rawImg) : null;
          const isInAuction = activeTab === 1;

          // Find the auction for this NFT if it's in auction
          const nftAuction = isInAuction
            ? auctions.find(
                (a) =>
                  a.nft.toLowerCase() === nft.nftAddress.toLowerCase() &&
                  a.nftId === nft.tokenId
              )
            : null;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={nft.tokenId}>
              <Card
                sx={{
                  background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
                  border: '1px solid rgba(51, 194, 255, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: isInAuction ? 'default' : 'pointer',
                  '&:hover': {
                    transform: isInAuction ? 'none' : 'translateY(-8px)',
                    boxShadow: isInAuction
                      ? '0 4px 16px rgba(51, 194, 255, 0.2)'
                      : '0 12px 40px rgba(51, 194, 255, 0.3)',
                    borderColor: 'rgba(51, 194, 255, 0.5)',
                  },
                }}
                onClick={() => !isInAuction && handleCreateAuction(nft)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={imgSrc || '/placeholder-nft.png'}
                  alt={m.name || `Token #${nft.tokenId}`}
                  sx={{
                    objectFit: 'cover',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.name || `Token #${nft.tokenId}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 2,
                      minHeight: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {m.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Token ID: {nft.tokenId}
                    </Typography>
                    {isInAuction && nftAuction && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#33C2FF',
                          fontWeight: 'bold',
                        }}
                      >
                        In Auction
                      </Typography>
                    )}
                  </Box>
                  {!isInAuction && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<GavelIcon />}
                      sx={{
                        mt: 2,
                        background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(51, 194, 255, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Create Auction
                    </Button>
                  )}
                  {isInAuction && nftAuction && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GavelIcon />}
                      component={Link}
                      to={`/auctions#${nftAuction.auctionContract._address}`}
                      sx={{
                        mt: 2,
                        borderColor: '#33C2FF',
                        color: '#33C2FF',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#123597',
                          bgcolor: 'rgba(51, 194, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      View Auction
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b0e11 0%, #1a1f2e 50%, #0b0e11 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(51, 194, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(18, 53, 151, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <RootHeader />
      
      <Container maxWidth="lg" sx={{ pt: 8, pb: 8, position: 'relative', zIndex: 1 }}>
        <Fade in={checked} timeout={1000}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <CollectionsIcon sx={{ fontSize: 48, color: '#33C2FF' }} />
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-1.5px',
                    mb: 1,
                    color: 'white',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  My Collection
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    fontWeight: 300,
                  }}
                >
                  Manage your NFTs and auctions
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mb: 4,
                borderBottom: '1px solid rgba(51, 194, 255, 0.2)',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{
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
                  label={`My Album (${myAlbumNfts.length})`}
                  icon={<AlbumIcon />}
                  iconPosition="start"
                  sx={{
                    color: activeTab === 0 ? '#33C2FF' : 'white',
                    fontWeight: activeTab === 0 ? 'bold' : 'medium',
                    zIndex: 1,
                    position: 'relative',
                  }}
                />
                <Tab
                  label={`My Auction (${myAuctionNfts.length})`}
                  icon={<GavelIcon />}
                  iconPosition="start"
                  sx={{
                    color: activeTab === 1 ? '#33C2FF' : 'white',
                    fontWeight: activeTab === 1 ? 'bold' : 'medium',
                    zIndex: 1,
                    position: 'relative',
                  }}
                />
              </Tabs>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#33C2FF' }} />
              </Box>
            ) : (
              renderNftGrid(activeTab === 0 ? myAlbumNfts : myAuctionNfts)
            )}
          </Box>
        </Fade>
      </Container>

      {selectedNft && (
        <CreateAuctionFromNftModal
          open={createAuctionOpen}
          onClose={handleCloseModal}
          nft={selectedNft}
          onSuccess={handleAuctionCreated}
        />
      )}
    </Box>
  );
}

export default Collection;

