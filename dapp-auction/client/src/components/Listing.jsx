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
    <Card
      sx={{
        background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
        border: 'none',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
        mb={2}
        gap={2}
      >
        <GavelIcon sx={{ fontSize: 32, color: '#33C2FF' }} />
        <Typography
        variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
      >
          All Auctions
        </Typography>
        <Button
          onClick={() => {
            refetchData();
          }}
          variant="outlined"
          sx={{
            ml: 1,
            borderColor: '#33C2FF',
            color: '#33C2FF',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(51, 194, 255, 0.3)',
              bgcolor: '#33C2FF',
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
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 4 }}
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
