import Footer from './components/Footer';
import Account from './components/Account';
import { useEth } from './contexts/EthContext';

import PageHeader from './components/PageHeader';
import PageTitleWrapper from './components/PageTitleWrapper';
import { Box, alpha, lighten, Container, Grid, useTheme } from '@mui/material';

import RootHeader from './components/RootHeader';
import Listing from './components/Listing';
import { useEffect } from 'react';
import { useState } from 'react';
import { getAuctionFactoryContract, getAuctions } from './utils';
import { useSnackbar } from 'notistack';

function AuctionApp() {
  useEffect(() => {
    var scrollToTopBtn = document.querySelector('.scrollToTopBtn');
    var rootElement = document.documentElement;
    const scrollFunction = () => {
      if (rootElement.scrollTop > 300) {
        scrollToTopBtn.classList.add('showBtn');
      } else {
        scrollToTopBtn.classList.remove('showBtn');
      }
    };

    function scrollToTop() {
      rootElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    scrollToTopBtn.addEventListener('click', scrollToTop);
    window.onscroll = function () {
      scrollFunction();
    };
  });
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [auctionFactoryContract, setAuctionFactoryContract] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const {
    state: { web3, networkID, accounts },
  } = useEth();
  useEffect(() => {
    if (web3 && networkID) {
      setAuctionFactoryContract(getAuctionFactoryContract(web3, networkID));
    }
  }, [web3, networkID]);

  useEffect(() => {
    async function fetchData() {
      const auctions = await getAuctions(
        web3,
        auctionFactoryContract,
        accounts
      );
      setAuctions(auctions);
    }
    if (auctionFactoryContract) {
      fetchData();
    }
  }, [auctionFactoryContract, web3, accounts]);
  async function refetchData() {
    const auctions = await getAuctions(web3, auctionFactoryContract, accounts);
    setAuctions(auctions);
    enqueueSnackbar('Auctions refreshed', {
      variant: 'success',
    });
  }
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        '.MuiPageTitle-wrapper': {
          background: theme.colors.alpha.trueWhite[5],
          marginBottom: `${theme.spacing(4)}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 1px 0 ${alpha(
                  lighten(theme.colors.primary.main, 0.7),
                  0.15
                )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
              : `0px 2px 4px -3px ${alpha(
                  theme.colors.alpha.black[100],
                  0.1
                )}, 0px 5px 12px -4px ${alpha(
                  theme.colors.alpha.black[100],
                  0.05
                )}`,
        },
      }}
    >
      <RootHeader />
      <PageTitleWrapper>
        <PageHeader refetchData={refetchData} />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12}>
            <Account auctions={auctions} />
          </Grid>
        </Grid>
        <Listing auctions={auctions} refetchData={refetchData} />
      </Container>
      <Footer />
      <button className="scrollToTopBtn cursor-pointer">☝️</button>
    </Box>
  );
}

export default AuctionApp;
