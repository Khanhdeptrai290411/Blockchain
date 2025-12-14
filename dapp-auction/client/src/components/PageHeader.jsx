import { Typography, Avatar, Grid, useTheme } from '@mui/material';
import { useEth } from '../contexts/EthContext';
import Creation from './Creation';

function PageHeader({ refetchData }) {
  const {
    state: { accounts },
  } = useEth();
    const user = {
      avatar: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${
        accounts === null ? '1' : accounts[0]
      }`,
    };

  const theme = useTheme();

  return (
    <Grid container alignItems="center">
      <Grid item>
        <Avatar
          sx={{
            mr: 2,
            width: theme.spacing(12),
            height: theme.spacing(12),
          }}
          variant="rounded"
          alt={user.name}
          src={user.avatar}
        />
      </Grid>
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          WELCOME
        </Typography>
        <Typography variant="subtitle2">
          Participate in NFT auctions now!
        </Typography>
        <Creation refetchData={refetchData} />
      </Grid>
    </Grid>
  );
}

export default PageHeader;
