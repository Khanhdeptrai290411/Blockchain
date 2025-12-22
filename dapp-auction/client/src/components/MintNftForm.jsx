import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useEth } from '../contexts/EthContext';

function MintNftForm({ onMinted }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();

  const [metadataUri, setMetadataUri] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMint = async (e) => {
    e.preventDefault();
    const uri = metadataUri.trim();

    if (!uri) {
      enqueueSnackbar('Metadata URI is required', { variant: 'error' });
      return;
    }
    if (!web3 || !networkID || !accounts || accounts.length === 0) {
      enqueueSnackbar('Web3 or account not ready', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const mintNftJson = require('../contracts/MintNFT.json');
      const deployed = mintNftJson.networks?.[networkID];
      if (!deployed?.address) {
        enqueueSnackbar('MintNFT is not deployed on this network', {
          variant: 'error',
        });
        setLoading(false);
        return;
      }

      const mintNftAddress = deployed.address;
      const mintNftContract = new web3.eth.Contract(
        mintNftJson.abi,
        mintNftAddress
      );

      const receipt = await mintNftContract.methods
        .mint(uri)
        .send({ from: accounts[0] });

      let tokenId = null;
      if (
        receipt.events &&
        receipt.events.Transfer &&
        receipt.events.Transfer.returnValues &&
        receipt.events.Transfer.returnValues.tokenId
      ) {
        tokenId = receipt.events.Transfer.returnValues.tokenId;
      } else {
        // fallback: read totalSupply as latest minted id
        tokenId = await mintNftContract.methods.totalSupply().call();
      }

      enqueueSnackbar(
        `Minted NFT successfully (tokenId: ${tokenId ?? 'unknown'})`,
        {
          variant: 'success',
        }
      );

      setMetadataUri('');
      if (onMinted) {
        onMinted(tokenId);
      }
    } catch (err) {
      console.error('[MintNftForm] Mint failed', err);
      enqueueSnackbar('Mint failed or rejected', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        background: 'linear-gradient(145deg, rgba(11, 14, 17, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)',
        border: 'none',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AddPhotoAlternateIcon sx={{ fontSize: 28, color: '#33C2FF' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Mint NFT
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Enter metadata URL (IPFS / HTTP) to mint NFT using your connected MetaMask wallet.
        </Typography>
        <form onSubmit={handleMint}>
          <TextField
            fullWidth
            margin="normal"
            label="Metadata URI"
            placeholder="https://gateway.pinata.cloud/ipfs/..."
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(51, 194, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(51, 194, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#33C2FF',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#33C2FF',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                boxShadow: '0 8px 32px rgba(51, 194, 255, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Minting...' : 'Mint'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default MintNftForm;


