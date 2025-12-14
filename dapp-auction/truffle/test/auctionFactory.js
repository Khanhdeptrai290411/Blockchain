const AuctionFactory = artifacts.require("AuctionFactory");

contract("AuctionFactory", () => {
  it("should compile and deploy", async () => {
    const AuctionFactoryInstance = await AuctionFactory.deployed();
    const auctions = await AuctionFactoryInstance.getAuctions();
    assert.equal(JSON.stringify(auctions), "[]", "[] wasn't the initial value");
  });
});
