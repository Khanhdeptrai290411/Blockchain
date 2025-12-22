import axios from 'axios';

// Pinata API configuration
// Users should set these in their .env file
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || '';

/**
 * Upload a file to Pinata IPFS
 * @param {File} file - The file to upload
 * @param {string} customName - Optional custom name for the file (defaults to file.name)
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export async function uploadFileToPinata(file, customName = null) {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
    throw new Error('Pinata credentials not configured. Please set REACT_APP_PINATA_JWT or REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in .env file');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: customName || file.name,
  });
  formData.append('pinataMetadata', metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    let config = {};
    if (PINATA_JWT) {
      config = {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      };
    } else {
      config = {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      };
    }

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      config
    );

    return res.data.IpfsHash; // CID
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error(`Failed to upload file: ${error.response?.data?.error?.details || error.message}`);
  }
}

/**
 * Upload JSON metadata to Pinata IPFS
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<string>} - IPFS hash (CID) of the metadata
 */
export async function uploadMetadataToPinata(metadata) {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
    throw new Error('Pinata credentials not configured. Please set REACT_APP_PINATA_JWT or REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in .env file');
  }

  try {
    let config = {};
    if (PINATA_JWT) {
      config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      };
    } else {
      config = {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      };
    }

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      config
    );

    return res.data.IpfsHash; // CID
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error(`Failed to upload metadata: ${error.response?.data?.error?.details || error.message}`);
  }
}

/**
 * Upload image and create metadata JSON, then upload metadata
 * @param {File} imageFile - The image file to upload
 * @param {string} name - NFT name
 * @param {string} description - NFT description
 * @param {Object} attributes - Optional attributes array
 * @returns {Promise<string>} - IPFS hash (CID) of the metadata JSON
 */
export async function uploadNftToPinata(imageFile, name, description, attributes = []) {
  // Step 1: Upload image with custom name
  const imageHash = await uploadFileToPinata(imageFile, name);
  const imageUrl = `ipfs://${imageHash}`;

  // Step 2: Create metadata JSON
  const metadata = {
    name: name,
    description: description,
    image: imageUrl,
    attributes: attributes,
  };

  // Step 3: Upload metadata
  const metadataHash = await uploadMetadataToPinata(metadata);
  const metadataUrl = `ipfs://${metadataHash}`;

  return {
    imageHash,
    imageUrl,
    metadataHash,
    metadataUrl,
    metadata,
  };
}

