require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { storeDataToFile, fillIpfsHashToMetaData } = require("./ipfsHelper.js");
const pinMetaData = require("./pinMetaData");

// Calls Pinata API's to pin file to IPFS
const pinDataToIPFS = async (filePath, fileName) => {
  // filePath = metadata filepath
  const pinataEndpoint = process.env.PINATA_ENDPOINT;
  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
  const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;
  const form_data = new FormData();

  await fillIpfsHashToMetaData(filePath);
  // try {
  //   form_data.append("file", fs.createReadStream(filePath));
  //   // console.log(form_data);
  //   const request = {
  //     method: "post",
  //     url: pinataEndpoint,
  //     maxContentLength: "Infinity",
  //     headers: {
  //       pinata_api_key: pinataApiKey,
  //       pinata_secret_api_key: pinataApiSecret,
  //       "Content-Type": `multipart/form-data; boundary=${form_data._boundary}`,
  //     },
  //     data: form_data,
  //   };
  //   // console.log("request:", request);
  //   const response = await axios(request);
  //   // console.log("Successfully pinned file to IPFS : ", response);
  //   await storeDataToFile(response.data);
  //   console.log("Successfully pinned data, added response to json file");
  //   await pinMetaData(filePath, fileName);
  // } catch (err) {
  //   console.log("Error occurred while pinning file to IPFS: ", err);
  // }
};

module.exports = pinDataToIPFS;
