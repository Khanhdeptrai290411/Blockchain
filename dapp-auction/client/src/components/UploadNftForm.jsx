import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useEth } from '../contexts/EthContext';
import { uploadNftToPinata } from '../utils/pinata';

function UploadNftForm({ onMinted }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState(''); // 'uploading', 'minting'

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Please select an image file', { variant: 'error' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      enqueueSnackbar('Please select an image file', { variant: 'error' });
      return;
    }
    if (!name.trim()) {
      enqueueSnackbar('NFT name is required', { variant: 'error' });
      return;
    }
    if (!web3 || !networkID || !accounts || accounts.length === 0) {
      enqueueSnackbar('Web3 or account not ready', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      setUploadStep('uploading');
      enqueueSnackbar('Uploading image to Pinata...', { variant: 'info' });

      // Upload image and metadata to Pinata
      const { metadataUrl } = await uploadNftToPinata(
        imageFile,
        name.trim(),
        description.trim() || 'No description'
      );

      setUploadStep('minting');
      enqueueSnackbar('Image uploaded! Minting NFT...', { variant: 'info' });

      // Mint NFT with metadata URL
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
        .mint(metadataUrl)
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
        `NFT minted successfully! Token ID: ${tokenId ?? 'unknown'}`,
        {
          variant: 'success',
        }
      );

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setName('');
      setDescription('');
      setUploadStep('');

      if (onMinted) {
        onMinted(tokenId);
      }
    } catch (err) {
      console.error('[UploadNftForm] Upload/Mint failed', err);
      enqueueSnackbar(
        err.message || 'Upload or mint failed. Please check your Pinata credentials.',
        {
          variant: 'error',
        }
      );
      setUploadStep('');
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
          <CloudUploadIcon sx={{ fontSize: 28, color: '#33C2FF' }} />
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
            Create New NFT
          </Typography>
        </Box>

        {(!process.env.REACT_APP_PINATA_JWT &&
          (!process.env.REACT_APP_PINATA_API_KEY ||
            !process.env.REACT_APP_PINATA_SECRET_KEY)) && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              background: 'rgba(255, 163, 25, 0.1)',
              border: '1px solid rgba(255, 163, 25, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)',
              '& .MuiAlert-icon': {
                color: '#FFA319',
              },
            }}
          >
            Pinata credentials not configured. Please set REACT_APP_PINATA_JWT
            or REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in your
            .env file.
          </Alert>
        )}

        <form onSubmit={handleMint}>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              disabled={loading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
                sx={{
                  mb: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'rgba(51, 194, 255, 0.1)',
                  },
                }}
              >
                {imageFile ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
            {imagePreview && (
              <Box
                sx={{
                  mt: 2,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '2px solid rgba(51, 194, 255, 0.3)',
                  }}
                />
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            margin="normal"
            label="NFT Name *"
            placeholder="My Awesome NFT"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
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

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            placeholder="Describe your NFT..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            multiline
            rows={3}
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
            disabled={loading || !imageFile || !name.trim()}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #33C2FF 0%, #123597 100%)',
              color: 'white',
              fontWeight: 'bold',
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #123597 0%, #33C2FF 100%)',
                boxShadow: '0 12px 40px rgba(51, 194, 255, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CloudUploadIcon />
              )
            }
          >
            {loading
              ? uploadStep === 'uploading'
                ? 'Uploading to Pinata...'
                : 'Minting NFT...'
              : 'Upload & Mint NFT'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default UploadNftForm;

