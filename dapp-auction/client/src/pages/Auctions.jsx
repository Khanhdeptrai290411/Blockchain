import { Box, Container, Typography, Button, alpha, Fade } from '@mui/material';
import { useEffect, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import RootHeader from '../components/RootHeader';
import Listing from '../components/Listing';
import { getAuctionFactoryContract, getAuctions } from '../utils';
import { useSnackbar } from 'notistack';
import GavelIcon from '@mui/icons-material/Gavel';
import { Link, useLocation } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function Auctions() {
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [auctionFactoryContract, setAuctionFactoryContract] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [checked, setChecked] = useState(false);
  const {
    state: { web3, networkID, accounts },
  } = useEth();

  useEffect(() => {
    setChecked(true);
  }, []);

  // Scroll to auction if hash is present in URL
  useEffect(() => {
    if (location.hash) {
      const auctionId = location.hash.substring(1); // Remove #
      setTimeout(() => {
        const element = document.getElementById(auctionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the element temporarily
          element.style.transition = 'box-shadow 0.3s ease';
          element.style.boxShadow = '0 0 20px rgba(51, 194, 255, 0.5)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);
        }
      }, 300);
    }
  }, [location.hash, auctions]);

  useEffect(() => {
    if (web3 && networkID) {
      setAuctionFactoryContract(getAuctionFactoryContract(web3, networkID));
    }
  }, [web3, networkID]);

  useEffect(() => {
    async function fetchData() {
      const auctionsData = await getAuctions(
        web3,
        auctionFactoryContract,
        accounts
      );
      setAuctions(auctionsData);
    }
    if (auctionFactoryContract && web3) {
      fetchData();
    }
  }, [auctionFactoryContract, web3, accounts, reloadTrigger]);

  // Reload when account changes (MetaMask connection)
  const currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;
  useEffect(() => {
    if (currentAccount && auctionFactoryContract) {
      setTimeout(() => {
        setReloadTrigger(prev => prev + 1);
      }, 100);
    }
  }, [currentAccount, auctionFactoryContract]);

  async function refetchData() {
    const auctionsData = await getAuctions(web3, auctionFactoryContract, accounts);
    setAuctions(auctionsData);
    enqueueSnackbar('Auctions refreshed', {
      variant: 'success',
    });
  }

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GavelIcon sx={{ fontSize: 48, color: '#33C2FF' }} />
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
                    NFT Auctions
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#ffffff', 0.8),
                      fontWeight: 300,
                    }}
                  >
                    Discover and bid on amazing NFTs
                  </Typography>
                </Box>
              </Box>
              <Button
                component={Link}
                to="/collection"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(51, 194, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                    boxShadow: '0 12px 40px rgba(51, 194, 255, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Auction
              </Button>
            </Box>
            <Listing auctions={auctions} refetchData={refetchData} />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Auctions;

