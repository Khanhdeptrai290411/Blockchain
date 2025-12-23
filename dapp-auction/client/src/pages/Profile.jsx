import { Box, Container, Typography, Avatar, alpha, Fade } from '@mui/material';
import { useEffect, useState } from 'react';
import { useEth } from '../contexts/EthContext';
import RootHeader from '../components/RootHeader';
import Account from '../components/Account';
import { getAuctionFactoryContract, getAuctions } from '../utils';
import PersonIcon from '@mui/icons-material/Person';

function Profile() {
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

  const refetchAuctions = () => setReloadTrigger((p) => p + 1);

  const user = {
    avatar: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${
      accounts === null || accounts.length === 0 ? '1' : accounts[0]
    }`,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
              <Box
                sx={{
                  p: 0.5,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                  boxShadow: '0 8px 32px rgba(51, 194, 255, 0.3)',
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid #0b0e11',
                    borderRadius: '20px',
                  }}
                  variant="rounded"
                  alt="User Avatar"
                  src={user.avatar}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#33C2FF' }} />
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: '-1.5px',
                      color: 'white',
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    My Profile
                  </Typography>
                </Box>
                {accounts && accounts.length > 0 ? (
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#ffffff', 0.8),
                      fontWeight: 300,
                    }}
                  >
                    {accounts[0].slice(0, 8)}...{accounts[0].slice(-6)}
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      fontWeight: 300,
                    }}
                  >
                    Please connect your wallet to view your profile
                  </Typography>
                )}
              </Box>
            </Box>
            <Account auctions={auctions} refetchAuctions={refetchAuctions} />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Profile;

