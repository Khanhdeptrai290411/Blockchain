import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  alpha,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GavelIcon from '@mui/icons-material/Gavel';
import CollectionsIcon from '@mui/icons-material/Collections';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ConnectWallet from './components/ConnectWallet';

const features = [
  {
    icon: <GavelIcon sx={{ fontSize: 48 }} />,
    title: 'Decentralized Auctions',
    description: 'Participate in NFT auctions powered by smart contracts on the blockchain. Fair, transparent, and secure.',
    color: '#33C2FF',
  },
  {
    icon: <CollectionsIcon sx={{ fontSize: 48 }} />,
    title: 'Create & Mint NFTs',
    description: 'Mint your own NFTs with custom metadata and images. Full ownership and control over your digital assets.',
    color: '#123597',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    title: 'Secure & Transparent',
    description: 'All transactions are verified on the blockchain. No intermediaries, no hidden fees.',
    color: '#FF6B6B',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
    title: 'Real-time Bidding',
    description: 'Place bids in real-time and watch auctions unfold. Get notified when you\'re outbid.',
    color: '#4ECDC4',
  },
];

function Landing() {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

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
      <Helmet>
        <title>NFT Auction - Decentralized NFT Marketplace</title>
        <meta charSet="utf-8" />
        <meta name="description" content="Decentralized NFT auction platform powered by blockchain smart contracts" />
      </Helmet>

      {/* Header */}
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 8,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}
          >
            NFT<span style={{ color: '#33C2FF' }}>Auction</span>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ConnectWallet />
            <Button
              component={Link}
              to="/auctions"
              variant="contained"
              size="large"
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
              endIcon={<ArrowForwardIcon />}
            >
              Launch App
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Fade in={checked} timeout={1000}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                fontWeight: 900,
                color: 'white',
                mb: 3,
                letterSpacing: '-2px',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sell & Bid on NFTs
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Governed by Smart Contracts
              </span>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: alpha('#ffffff', 0.8),
                mb: 4,
                maxWidth: '700px',
                mx: 'auto',
                fontWeight: 300,
              }}
            >
              A decentralized marketplace where you can create, auction, and trade NFTs
              with complete transparency and security on the blockchain.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/auctions"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 5,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 32px rgba(51, 194, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                    boxShadow: '0 12px 40px rgba(51, 194, 255, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Get Started
              </Button>
              <Button
                component={Link}
                to="/auctions"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: alpha('#33C2FF', 0.5),
                  color: '#33C2FF',
                  fontWeight: 'bold',
                  px: 5,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: '#33C2FF',
                    background: alpha('#33C2FF', 0.1),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore Auctions
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 12, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            color: 'white',
            fontWeight: 800,
            mb: 6,
            letterSpacing: '-1px',
          }}
        >
          Why Choose NFT Auction?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in={checked} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(feature.color, 0.1)} 0%, ${alpha(feature.color, 0.05)} 100%)`,
                    border: `1px solid ${alpha(feature.color, 0.2)}`,
                    borderRadius: 3,
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${alpha(feature.color, 0.3)}`,
                      borderColor: feature.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      textAlign: 'center',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ mb: 8, position: 'relative', zIndex: 1 }}>
        <Fade in={checked} timeout={1500}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(51, 194, 255, 0.1) 0%, rgba(18, 53, 151, 0.1) 100%)',
              border: `1px solid ${alpha('#33C2FF', 0.3)}`,
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 2,
                letterSpacing: '-1px',
              }}
            >
              Ready to Start Your NFT Journey?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha('#ffffff', 0.8),
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Connect your wallet and start creating, bidding, and trading NFTs today.
            </Typography>
            <Button
              component={Link}
              to="/auctions"
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                color: 'white',
                fontWeight: 'bold',
                px: 6,
                py: 2,
                borderRadius: 2,
                fontSize: '1.1rem',
                boxShadow: '0 8px 32px rgba(51, 194, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                  boxShadow: '0 12px 40px rgba(51, 194, 255, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Launch App Now
            </Button>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Landing;
