import { Box, Card, Container, styled, Button, useTheme, alpha,Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import CollectionsIcon from '@mui/icons-material/Collections';

const HeaderWrapper = styled(Card)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(4)};
    background: linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%);
    border-bottom: 1px solid rgba(51, 194, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  `
);

function RootHeader() {
  const theme = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/collection', label: 'My Collection', icon: <CollectionsIcon /> },
    { path: '/auctions', label: 'Auctions', icon: <GavelIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
  ];

  return (
    <HeaderWrapper>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flex={1}
          >
            <Box display="flex" alignItems="center" gap={3}>
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
              <Box display="flex" gap={1}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? '#33C2FF' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                      borderBottom: location.pathname === item.path ? '2px solid' : 'none',
                      borderBottomColor: location.pathname === item.path ? '#33C2FF' : 'transparent',
                      borderRadius: 0,
                      '&:hover': {
                        color: '#33C2FF',
                        background: 'rgba(51, 194, 255, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Box>
            <Box>
              <ConnectWallet />
            </Box>
          </Box>
        </Box>
      </Container>
    </HeaderWrapper>
  );
}

export default RootHeader;
