import { Box, Container, Grid, Typography, Avatar, alpha, Fade } from '@mui/material';
import { useEth } from '../contexts/EthContext';
import RootHeader from '../components/RootHeader';
import UploadNftForm from '../components/UploadNftForm';
import { useEffect, useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function Home() {
  const {
    state: { accounts, web3 },
  } = useEth();
  const [ethBalance, setEthBalance] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!web3 || !accounts || accounts.length === 0) return;

    const loadBalance = async () => {
      try {
        const balWei = await web3.eth.getBalance(accounts[0]);
        const balEth = web3.utils.fromWei(balWei, 'ether');
        setEthBalance(parseFloat(balEth).toFixed(4));
      } catch (e) {
        console.error('[Home] Failed to load balance', e);
      }
    };

    loadBalance();
  }, [web3, accounts]);

  const user = {
    avatar: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${
      accounts === null || accounts.length === 0 ? '1' : accounts[0]
    }`,
  };

  const handleMinted = () => {
    // Refresh page or show success message
    window.location.reload();
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
            <Grid container spacing={4} alignItems="center" sx={{ mb: 6 }}>
              <Grid item>
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
              </Grid>
              <Grid item xs>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-1.5px',
                    mb: 2,
                    color: 'white',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back!
                </Typography>
                {accounts && accounts.length > 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: alpha('#ffffff', 0.8),
                      }}
                    >
                      {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
                    </Typography>
                    {ethBalance !== null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceWalletIcon sx={{ color: '#33C2FF' }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {ethBalance} ETH
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                    }}
                  >
                    Please connect your wallet to get started
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  mb: 2,
                  color: 'white',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create Your NFT
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha('#ffffff', 0.8),
                  maxWidth: '700px',
                  fontWeight: 300,
                }}
              >
                Upload an image to create a new NFT. The image will be automatically uploaded to IPFS via Pinata,
                and a metadata file will be created and minted on the blockchain.
              </Typography>
            </Box>
            <UploadNftForm onMinted={handleMinted} />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Home;

