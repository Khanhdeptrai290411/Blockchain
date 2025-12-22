export function resolveIpfsUri(uri) {
  if (!uri) return uri;
  if (uri.startsWith("ipfs://")) {
    const cidAndPath = uri.slice("ipfs://".length);
    // Dùng gateway công khai để browser fetch được
    return `https://ipfs.io/ipfs/${cidAndPath}`;
  }
  return uri;
}

export function getAuctionFactoryContract(web3, networkID) {
  if (web3 === null || networkID === null) {
    console.log(
      "Unable to get AuctionFactory contract. web3 or networkID is null."
    );
    return;
  }

  const auctionFactoryJson = require("./contracts/AuctionFactory.json");
  if (
    auctionFactoryJson &&
    auctionFactoryJson.networks[networkID] === undefined
  ) {
    console.log("Unable to get AuctionFactory contract. networkID is invalid.");
    return;
  }
  const auctionFactoryAddress = auctionFactoryJson.networks[networkID].address;
  const auctionFactoryContract = new web3.eth.Contract(
    auctionFactoryJson.abi,
    auctionFactoryAddress
  );
  return auctionFactoryContract;
}

export async function getAuctions(web3, auctionFactoryContract, accounts) {
  if (
    web3 === null ||
    auctionFactoryContract === null ||
    accounts == null ||
    auctionFactoryContract === undefined
  ) {
    console.log(
      "Unable to get auctions. web3 or auctionFactoryContract is null."
    );
    return [];
  }
  let auctionContractAddresses = [];
try {
  auctionContractAddresses = await auctionFactoryContract.methods.getAuctions().call();
  console.log("[getAuctions] addresses:", auctionContractAddresses);
} catch (e) {
  console.error("[getAuctions] Factory.getAuctions() failed. ABI/address mismatch?", e);
  return [];
}

  const auctionContractJson = require("./contracts/Auction.json");
  const mintNftContractJson = require("./contracts/MintNFT.json");
  const auctions = [];
  for (let auctionContractAddress of auctionContractAddresses) {
    try {
      // 1) Skip nếu address không có bytecode (không phải contract)
      const code = await web3.eth.getCode(auctionContractAddress);
      if (!code || code === "0x") {
        console.warn("[getAuctions] Skip non-contract:", auctionContractAddress);
        continue;
      }

      const auctionContract = new web3.eth.Contract(
        auctionContractJson.abi,
        auctionContractAddress
      );

      // 2) Bọc luôn các call dễ gây decode fail
      const nftId = parseInt(await auctionContract.methods.nftId().call());
      const info = await auctionContract.methods
        .info()
        .call({ from: accounts[0] });

      const mintNftContractAddress = await auctionContract.methods.nft().call();
      const mintNftContract = new web3.eth.Contract(
        mintNftContractJson.abi,
        mintNftContractAddress
      );

      const nftMetadataUriRaw = await mintNftContract.methods
        .tokenURI(nftId)
        .call();

      let nftMetadataJson = null;
      let pinataImageUri = null;
      try {
        const nftMetadataUri = resolveIpfsUri(nftMetadataUriRaw);
        const nftMetadata = await fetch(nftMetadataUri);
        const text = await nftMetadata.text();
        try {
          nftMetadataJson = JSON.parse(text);
          pinataImageUri =
            nftMetadataJson.image ||
            nftMetadataJson.image_url ||
            nftMetadataJson.imageUrl ||
            nftMetadataJson.animation_url ||
            nftMetadataJson.thumbnail ||
            null;
        } catch {
          // tokenURI trỏ thẳng tới ảnh/binary → dùng luôn URL làm image, sinh metadata tối thiểu
          nftMetadataJson = {
            name: `Token #${nftId}`,
            description: "",
            image: nftMetadataUri,
          };
          pinataImageUri = nftMetadataUri;
        }
      } catch (metaErr) {
        console.warn(
          "[getAuctions] Failed to fetch metadata for",
          auctionContractAddress,
          metaErr
        );
      }

      const auction = {
        pinataImageUri,
        pinataMetadata: nftMetadataJson,
        seller: info[0],
        highestBidder: info[1],
        startAt: parseInt(info[2]),
        duration: parseInt(info[3]),
        endAt: parseInt(info[4]),
        increment: parseInt(info[5]),
        highestBid: parseInt(info[6]),
        nftId: parseInt(info[7]),
        userBidAmount: parseInt(info[8]),
        started: info[9],
        ended: info[10],
        nft: info[11],
        auctionContract: auctionContract,
      };

      auctions.push(auction);
    } catch (e) {
      console.warn(
        "[getAuctions] Skip bad auction:",
        auctionContractAddress,
        e
      );
      continue;
    }
}

  return auctions;
}

export function displayInGwei(wei) {
  return wei / 1000000000;
}

export function displayInHours(seconds) {
  // rounded to 2 decimal places
  return Math.round((seconds / 60 / 60) * 100) / 100;
}

export function displayTimestampInHumanReadable(timestamp) {
  if (timestamp === 0) {
    return "Not Started";
  }
  return new Date(timestamp * 1000).toLocaleString();
}
