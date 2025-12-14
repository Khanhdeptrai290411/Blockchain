require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const config = require("config");
var axios = require("axios");

const pinMetaData = async (metaDataFilePath, fileName) => {
  const ipfsFilePath = path.join(__dirname, config.get("ipfsFile.location"));
  const ipfs = await fs.readFile(ipfsFilePath, "utf8");
  var ipfsData = JSON.parse(ipfs);
  ipfsData = ipfsData[ipfsData.length - 1];
  console.log(ipfsData);

  var metadata = await fs.readFile(metaDataFilePath, "utf8");
  var metadataJson = JSON.parse(metadata);
  // console.log(metadataJson);
  var data = JSON.stringify({
    ipfsPinHash: ipfsData.IpfsHash,
    name: fileName,
    keyvalues: {
      name: metadataJson.name,
      image: metadataJson.image,
      description: metadataJson.description,
    },
  });
  // console.log(data);

  let authorization = "Bearer " + process.env.PINATA_JWT;
  var req = {
    method: "put",
    url: "https://api.pinata.cloud/pinning/hashMetadata",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    data: data,
  };
  const res = await axios(req);
  console.log("Successfully added metadata to pinned stuff");
  console.log(res.data);
};

module.exports = pinMetaData;
