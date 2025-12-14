const path = require("path");
const pinDataToIPFS = require("./pinDataToIPFS");
const pinImage = require("./pinImage");

process.env.NODE_ENV = "DEV";

const pinData = async () => {
  const imgPath = path.join(__dirname, "../assets/octopus.jpg");
  await pinImage(imgPath);
  const dataPath = path.join(__dirname, "../data/metadata.json");
  pinDataToIPFS(dataPath, "metadata.json");
};

pinData();
