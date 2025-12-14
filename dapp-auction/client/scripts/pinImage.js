require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { storeDataToFile } = require("./ipfsHelper.js");

// Calls Pinata API's to pin file to IPFS
const pinImage = async (filePath) => {
  const pinataEndpoint = process.env.PINATA_ENDPOINT;
  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
  const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;
  const form_data = new FormData();
  try {
    form_data.append("file", fs.createReadStream(filePath));
    const request = {
      method: "post",
      url: pinataEndpoint,
      maxContentLength: "Infinity",
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret,
        "Content-Type": `multipart/form-data; boundary=${form_data._boundary}`,
      },
      data: form_data,
    };
    const response = await axios(request);
    await storeDataToFile(response.data);
    console.log("Successfully pinned image, response added to json file");
  } catch (err) {
    console.log("Error occurred while pinning file to IPFS: ", err);
  }
};

module.exports = pinImage;
