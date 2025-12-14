import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

function Copyright() {
  return (
    <Typography variant="body1" color="text.secondary">
      {'Copyright © '}
      {new Date().getFullYear()}{' '}
      <Link color="inherit" href="https://github.com/tlylt/dapp-auction">
        Team NFT, CZ4153-BLOCKCHAIN TECHNOLOGY NTU
      </Link>
    </Typography>
  );
}

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h5">
            Decentralized Auction Application for NFTs
          </Typography>
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
}
