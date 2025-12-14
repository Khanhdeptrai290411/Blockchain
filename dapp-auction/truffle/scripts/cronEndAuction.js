const AuctionFactory = artifacts.require("AuctionFactory");
const Auction = artifacts.require("Auction");

module.exports = async function (callback) {
  try {
    // Fetch accounts from wallet - these are unlocked
    // In production environment, private admin accounts will be used instead
    const accounts = await web3.eth.getAccounts();

    // Fetch the deployed auction factory
    const auctionFactory = await AuctionFactory.deployed();
    console.log("AuctionFactory fetched", auctionFactory.address);

    // Fetch all the created auctions from auction factory
    // Iterate through and help end the auction if
    // - the auction has started
    // - the auction has not ended
    // - the current time is greater than the end time (endAt)
    const auctions = await auctionFactory.getAuctions();
    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i];
      console.log("Auction fetched", auction);
      const auctionContract = await Auction.at(auction);
      const auctionDetails = await auctionContract.info();
      const auctionStarted = auctionDetails[9];
      const auctionEnded = auctionDetails[10];
      const auctionEndAt = auctionDetails[4];
      if (
        auctionStarted &&
        !auctionEnded &&
        auctionEndAt < Math.floor(Date.now() / 1000)
      ) {
        console.log("Found an auction that has ended");
        console.log("System will now help to close the auction");
        await auctionContract.end({ from: accounts[0] });
        console.log("Auction closed");
      } else {
        console.log("This auction needs not be closed, skipping...");
      }
      console.log("--------------------------------------------");
    }
    console.log("All auctions have been checked");
  } catch (error) {
    console.log(error);
  }
  callback();
};
