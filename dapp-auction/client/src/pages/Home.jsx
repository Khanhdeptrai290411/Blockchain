import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  alpha,
  Fade,
  Chip,
  Card,
  CardContent,
  Stack,
  Button,
} from '@mui/material';
import { useEth } from '../contexts/EthContext';
import RootHeader from '../components/RootHeader';
import UploadNftForm from '../components/UploadNftForm';
import MintNftForm from '../components/MintNftForm';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import GavelIcon from '@mui/icons-material/Gavel';
import CollectionsIcon from '@mui/icons-material/Collections';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Home() {
  const {
    state: { accounts, balanceEth, networkID },
    refreshBalance,
  } = useEth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      refreshBalance();
    }
  }, [accounts, refreshBalance]);

  const user = {
    avatar: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${
      accounts === null || accounts.length === 0 ? '1' : accounts[0]
    }`,
  };

  const handleMinted = () => {
    // refresh balance after mint
    refreshBalance();
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
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          right: '-120px',
          top: '-80px',
          background: 'radial-gradient(circle, rgba(51,194,255,0.14) 0%, rgba(11,14,17,0) 65%)',
          filter: 'blur(40px)',
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
                <Box
                  sx={{
                    width: 120,
                    height: 6,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #33C2FF 0%, #123597 100%)',
                    mb: 2.5,
                  }}
                />
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<VerifiedIcon sx={{ color: '#33C2FF !important' }} />}
                        label={`Account ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`}
                        sx={{
                          color: 'white',
                          background: 'rgba(51, 194, 255, 0.1)',
                          border: '1px solid rgba(51, 194, 255, 0.25)',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<SecurityIcon sx={{ color: '#33C2FF !important' }} />}
                        label={`Network ID ${networkID ?? '...'}`}
                        sx={{
                          color: 'white',
                          background: 'rgba(51, 194, 255, 0.1)',
                          border: '1px solid rgba(51, 194, 255, 0.25)',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<AccountBalanceWalletIcon sx={{ color: '#33C2FF !important' }} />}
                        label={
                          balanceEth !== null ? `${parseFloat(balanceEth).toFixed(4)} ETH` : '...'
                        }
                        sx={{
                          color: 'white',
                          background: 'rgba(51, 194, 255, 0.1)',
                          border: '1px solid rgba(51, 194, 255, 0.25)',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
                      <Button
                        component={Link}
                        to="/collection"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
                          color: 'white',
                          fontWeight: 700,
                          px: 3,
                          boxShadow: '0 10px 30px rgba(51, 194, 255, 0.35)',
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 14px 40px rgba(51, 194, 255, 0.45)',
                          },
                        }}
                      >
                        Xem bộ sưu tập
                      </Button>
                      <Button
                        component={Link}
                        to="/auctions"
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: 'rgba(51, 194, 255, 0.5)',
                          color: '#33C2FF',
                          fontWeight: 700,
                          px: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#33C2FF',
                            background: 'rgba(51, 194, 255, 0.12)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Đi tới đấu giá
                      </Button>
                    </Stack>
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
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} md={8}>
                <UploadNftForm onMinted={handleMinted} />

                {/* Alternate: Mint from existing metadata URI */}
                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'rgba(255,255,255,0.75)', mb: 1 }}
                  >
                    Hoặc nếu đã có metadata URI sẵn, nhập để MINT:
                  </Typography>
                  <MintNftForm onMinted={handleMinted} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(160deg, rgba(51, 194, 255, 0.18) 0%, rgba(18, 53, 151, 0.42) 100%)',
                    border: '1px solid rgba(51, 194, 255, 0.25)',
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CloudUploadIcon />
                      Quick tips
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                      1) Chọn ảnh rõ nét; 2) Điền tên & mô tả ngắn gọn; 3) Nhấn "Upload & Mint NFT".
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(11,14,17,0.55)',
                        border: '1px dashed rgba(51, 194, 255, 0.3)',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      Sau khi mint, NFT sẽ vào thẳng "My Collection". Bạn có thể mở tab "My Auction" để tạo phiên đấu giá.
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Intro / Value props */}
            <Grid container spacing={3} sx={{ mt: 6 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
                    border: '1px solid rgba(51, 194, 255, 0.25)',
                    borderRadius: 3,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CollectionsIcon sx={{ color: '#33C2FF' }} />
                      <Typography variant="h6" sx={{ color: '#33C2FF', fontWeight: 800 }}>
                        Tạo & Mint NFT
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Upload ảnh, tự động đẩy lên IPFS qua Pinata, tạo metadata và mint ngay trên blockchain.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
                    border: '1px solid rgba(51, 194, 255, 0.25)',
                    borderRadius: 3,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GavelIcon sx={{ color: '#33C2FF' }} />
                      <Typography variant="h6" sx={{ color: '#33C2FF', fontWeight: 800 }}>
                        Bộ sưu tập & Đấu giá
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      NFT mint xong sẽ vào My Collection; mở tab My Auction để tạo phiên bán, nhận bid theo thời gian thực.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
                    border: '1px solid rgba(51, 194, 255, 0.25)',
                    borderRadius: 3,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FlashOnIcon sx={{ color: '#33C2FF' }} />
                      <Typography variant="h6" sx={{ color: '#33C2FF', fontWeight: 800 }}>
                        An toàn & minh bạch
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Kết nối MetaMask, lưu trữ IPFS, hợp đồng minh bạch; số dư, bid, trạng thái hiển thị realtime.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Team section */}
            <Box sx={{ mt: 8 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  mb: 3,
                  color: 'white',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Nhóm phát triển
              </Typography>
              <Grid container spacing={3}>
                {[
                  { name: 'Nguyễn Đình Quốc Khánh', role: 'Blockchain & Smart Contract' },
                  { name: 'Trần Thảo Nguyên', role: 'Frontend & UX' },
                  { name: 'Võ Thị Hồng Anh', role: 'IPFS / Pinata & QA' },
                  { name: 'Lê Quang Phát', role: 'Backend & DevOps' },
                ].map((member) => (
                  <Grid item xs={12} sm={6} md={3} key={member.name}>
                    <Card
                      sx={{
                        height: '100%',
                        background: 'linear-gradient(150deg, rgba(51, 194, 255, 0.12) 0%, rgba(18, 53, 151, 0.28) 100%)',
                        border: '1px solid rgba(51, 194, 255, 0.3)',
                        borderRadius: 3,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                      }}
                    >
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {member.role}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Home;

