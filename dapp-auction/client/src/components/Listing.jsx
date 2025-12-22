import { Card, Box, Grid, Typography, List, Button } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import AuctionDetails from './AuctionDetails';
function Listing({ auctions, refetchData }) {
  if (auctions === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h3">Loading...</Typography>
      </Box>
    );
  }
  return (
    <Card>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
        mb={2}
        gap={2}
      >
        <GavelIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          All Auctions
        </Typography>
        <Button
          onClick={() => {
            refetchData();
          }}
          variant="outlined"
          color="primary"
          sx={{
            ml: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
              bgcolor: 'primary.main',
              color: 'white',
            },
          }}
        >
          Refresh
        </Button>
      </Box>
      <Grid spacing={0} container>
        <Box py={4} pr={4} flex={1}>
          <Grid
            container
            xs={12}
            item
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <List
              sx={{
                width: '80%',
                '& .MuiListItem-root': {
                  marginBottom: 2,
                },
              }}
            >
              {auctions.length === 0 ? (
                <Typography
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  No Auctions available at the moment...
                </Typography>
              ) : (
                auctions.map((auction, idx) => (
                  <AuctionDetails
                    auction={auction}
                    refetchData={refetchData}
                    key={idx}
                  />
                ))
              )}
            </List>
          </Grid>
        </Box>
      </Grid>
    </Card>
  );
}

export default Listing;
