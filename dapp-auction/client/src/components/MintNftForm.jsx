import { Card, CardContent, TextField, Button, Typography } from '@mui/material';
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
      variant="outlined"
      sx={{
        mb: 2,
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Mint NFT
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Nhập URL metadata (IPFS / HTTP) để tự mint NFT bằng ví MetaMask hiện
          tại.
        </Typography>
        <form onSubmit={handleMint}>
          <TextField
            fullWidth
            margin="normal"
            label="Metadata URI"
            placeholder="https://gateway.pinata.cloud/ipfs/..."
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? 'Minting...' : 'Mint'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default MintNftForm;


