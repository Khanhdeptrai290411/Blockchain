import { Card, Box, Grid, Typography, List, Button } from '@mui/material';
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
      <Typography
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
        variant="h4"
      >
        All Auctions{' '}
        <Button
          onClick={() => {
            refetchData();
          }}
          variant="text"
          color="secondary"
          size="small"
        >
          Refresh
        </Button>
      </Typography>
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
              }}
            >
              {auctions === [] ? (
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
