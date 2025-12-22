const AuctionFactory = artifacts.require("AuctionFactory");
const MintNFT = artifacts.require("MintNFT");
const Auction = artifacts.require("Auction");

const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

const gwei = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "gwei"));
};

module.exports = async function (callback) {
  try {
    // Fetch accounts from wallet - these are unlocked
    const accounts = await web3.eth.getAccounts();

    // Fetch the deployed auction factory
    const auctionFactory = await AuctionFactory.deployed();
    console.log("AuctionFactory fetched", auctionFactory.address);

    // Fetch the deployed MintNFT
    const mintNFT = await MintNFT.deployed();
    console.log("MintNFT fetched", mintNFT.address);
    // Set up 7 demo users in an array in a loop
    const demoUsers = [];
    for (let i = 0; i < 7; i++) {
      demoUsers.push({
        account: accounts[i],
      });
    }

    // Read URL from allDemoNFTs.json
    const allDemoNFTs = require("./allDemoNFTs.json");
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      const nft = allDemoNFTs[i];
      const res = await mintNFT.mint(nft.ipfsHash, { from: user.account });
      const tokenId = res.receipt.logs[0].args.tokenId.words[0];

      let name = `Token #${tokenId}`;
      let description = "";
      try {
        // ipfsHash ở đây đã là HTTP gateway URL tới metadata.json
        const metaRes = await fetch(nft.ipfsHash);
        const metaJson = await metaRes.json();
        if (metaJson.name) name = metaJson.name;
        if (metaJson.description) description = metaJson.description;
      } catch (e) {
        console.log("Failed to fetch metadata for demo NFT", nft.ipfsHash, e);
      }

      demoUsers[i].tokenId = tokenId;
      demoUsers[i].name = name;
      demoUsers[i].description = description;
    }

    // Construct auction
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      let duration;
      switch (i) {
        case 0:
          duration = 60;
          break;
        case 2:
          duration = 120;
          break;
        case 4:
          duration = 180;
          break;
        default:
          duration = Math.floor(Math.random() * 1440) + 1;
      }
      const auction = await auctionFactory.createNewAuction(
        mintNFT.address,
        user.tokenId,
        gwei(1000000000 + 10000000 * i),
        gwei(10000000 + 10000000 * i),
        duration, // set a random duration between 1 minute and 24 hours
        { from: user.account }
      );
      user.auctionAddress = auction.logs[0].args.newContractAddress;
    }

    // Each user approves the auction factory to spend their NFT
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      await mintNFT.approve(user.auctionAddress, user.tokenId, {
        from: user.account,
      });
    }

    // Start half of the auctions
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      if (i % 2 === 0) {
        // fetch auction
        const auction = await Auction.at(user.auctionAddress);
        // start auction
        await auction.start({ from: user.account });
      }
    }

    // Print out the demo users
    console.log("These are the demo users:\n");
    demoUsers.forEach((u, idx) => {
      console.log(
        `#${idx} account=${u.account} tokenId=${u.tokenId} name="${u.name}" auctionAddress=${u.auctionAddress}`
      );
    });
  } catch (error) {
    console.log(error);
  }
  callback();
};
