# DApp - Auction

[![Continuous Integration](https://github.com/tlylt/dapp-auction/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tlylt/dapp-auction/actions/workflows/ci.yml)

NFTAuction: Sell & Bid on NFTs Auctions Governed by Smart Contract

## Quick Start

```bash
# start local blockchain
ganache
# keep track of private keys to import account for testing
# 0x156def9ee6e65599671d0829e5994b26f786cbdf142450a2cb0a40a78e6fa250
# 0x64af5f4d553f98aeb2d992e2a6bed318da9fdf65b94ab07cc4fbe9fabb5ed6f4
ganache
cd truffle
truffle migrate --reset --network development
truffle exec scripts/seed.js --network development

cd client
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

Upload NFT data to IPFS

```bash
cd client
node scripts/runScript.js
# Save IPFS hash QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH
```

Mint NFT

```bash
cd truffle
npx truffle console --network development
migrate # optional
const nft = await MintNFT.deployed()
nft.address # address where MintNFT contract is deployed to

# Once the above are confirmed, you can mine your nft
let res = await nft.mint('https://gateway.pinata.cloud/ipfs/QmZ5YDGxnAjtHB6apV2wAiRUAcAXeNsNfsaSHPjosGnTZT')
let tokenId = res.receipt.logs[0].args.tokenId.words[0]
tokenId

await nft.ownerOf(tokenId)
```

Seed the local blockchain with some test data

```bash
ganache
cd truffle
truffle migrate --reset --network development
truffle exec scripts/seed.js --network development
```

## Setup Instructions

The project is setup using the Truffle suite for Ethereum, using Ganache to run a local blockchain. The project is also setup using React, and uses the React Truffle box to interact with deployed smart contracts on the Ethereum blockchain from a React web app.

## Install Truffle Suite

1. Install Truffle and Ganache globally

```

npm i -g truffle ganache

```

2. Install [MetaMask chrome extension](https://metamask.io/download/)

3. Setup local Ethereum blockchain on Ganache. Alternatively, download the Desktop app here (will be good for copying private keys to import accounts to MetaMask)

4. Check the port it is running on (7545 if Ganache Desktop or 8545 if Ganache CLI, by default), then edit `truffle-config.js` (`networks/development`) to match the port. If on Ganache Desktop, change the default port to 8545

5. On MetaMask, connect to your local blockchain (localhost:8545). Import an account from Ganache to MetaMask. You can copy the private key from Ganache (`Show Key` in `Accounts` tab in Ganache Desktop) and import it into MetaMask.
6. Deploy the smart contracts (if any changes) to the local blockchain. You can double check contract is deployed in Ganache Desktop > `Contracts` tab

```

// Ganache CLI
cd truffle
npm i # install the @openzeppelin/contracts npm dependency
truffle migrate --network development

```

5. Start the React web app

```

cd client
npm install
npm start

```

## Minting NFT

### Instructions

First we need to obtain the ipfs hash for the nft metadata that you want

1. Navigate into client. Find a picture or gif that you like and save it into client/assets together with "octo.gif" and "octopus.jpg"
2. Open client/data/metadata.json. Change the name, description and attributes to your liking. The image link does not matter.
3. Edit runScript.js in client/scripts by editting line 6 imgPath to be: const filePath = path.join(\_\_dirname, "../assets/{your file name}.{filetype}")
4. Run runScript.js

```

node scripts/runScript.js

```

5. To view the pinned object, browse: https://gateway.pinata.cloud/ipfs/{your_IpfsHash}. Your ipfsHash can be obtained from the last entry in ipfsHash.json
   Congratulations, you have now successfully pinned the nft metadata that you want.

Now we need to mint an NFT using the metadata you have just created. We do this in the Goerli Testnet as our contract has already been deployed there.

1. First you need some GoerliETH to mint NFT on the network. Go to https://goerli-faucet.pk910.de/ to mine some test ethers.
2. Navigate into from the folder root ./truffle on your cmdln and open the truffle console and key in the following commands.

```

cd truffle
npx truffle console --network development
const nft = await MintNFT.deployed() //returns undefined
nft.address // address where MintNFT contract is deployed to. Record this down for later
// Once the above are confirmed, you can mine your nft
let res = await nft.mint('https://gateway.pinata.cloud/ipfs/{ipfsHash}') // ipfsHash is from step 5 previously
let tokenId = res.receipt.logs[0].args.tokenId.words[0] // the NFT token ID. Record this down for later

await nft.ownerOf({token id}) // token id obtained from the previous step "type", this command should return your metamask address.

```

3. You have now successfully minted your nft. View the nft at: https://testnets.opensea.io/assets/goerli/0x60dd627e671F65b8cDFaf39AA0FB6b00ae1C18D6/{your_token_id}

## Auction Your Minted NFT

1. Follow the previous section and note down the returned
   - nft.address
   - token id
2. Make sure you know which chain you minted your NFT on before proceeding. Our frontend queries the local Ganache development network by default, and will NOT work if your NFT was minted on other test networks
3. Press Create Auction, and fill in the form fields as below
   - NFT Address --> nft.address
   - NFT Token Id --> token id
   - Starting Bid / Increment --> as desired

## Smart Contract Design

### Auction

### User Flow

1. NFT seller starts an auction
   1. User first deploys the auction contract
   2. User approves the auction contract to transfer his/her NFT from the ERC721 contract
   3. User starts the auction via `start()` function, and supplies:
      1. NFT address
      2. NFT ID
      3. Starting bid
      4. Bid increment limit
      5. Duration of auction
2. User joins the auction
   1. User views the auction details by calling `info()` function
   2. User participate in the auction by calling `bid()` function, and supplies:
      1. Amount to bid
         1. Which must be higher than the starting/existing bid
         2. For the second bid onwards, the amount is treated as a bid increment, and must be higher than the increment limit
   3. User can only withdraw bid amount if he/she is not the highest bidder
3. NFT seller settles the auction
   1. User views the auction details by calling `info()` function
   2. User settles the auction by calling `end()` function
      1. If the auction is not yet ended, the function will revert
      2. If the auction is ended, the function will transfer the NFT to the highest bidder, and transfer the funds to the NFT seller
4. Auction participants who are not the highest bidder can withdraw their bid amount
   1. User views the auction details by calling `info()` function
   2. User withdraws the bid amount by calling `withdraw()` function

### Prevent Reentrancy Attack

What is a reentrancy attack?

> A reentrancy attack occurs when a function makes an external call to another untrusted contract.
> Then the untrusted contract makes a recursive call back to the original function in an attempt to drain funds.

How to prevent reentrancy attack?

> To prevent a reentrancy attack in a Solidity smart contract, you should:
>
> - Ensure all state changes happen before calling external contracts, i.e., update balances or code internally before calling external code
> - se function modifiers that prevent reentrancy

Resources:

- [Hack Solidity: Reentrancy Attack](https://hackernoon.com/hack-solidity-reentrancy-attack)
- [Re-Entrancy Attacks. How to avoid smart contract hacks and loss of funds](https://www.youtube.com/watch?v=6bQvKCKrATM)

### Prevent Overflow Bug

Mathematical operations in Solidity are subject to overflow and underflow bugs. These bugs can be exploited to drain funds from a contract.

One possible solution is to use the SafeMath library. However, the SafeMath library is not used in this project as stated in the comment:

> /\*\*
>
> - @dev Wrappers over Solidity's arithmetic operations.
> -
> - NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
> - now has built in overflow checking.
>   \*/

Our auction contract uses Solidity 0.8.0, which has built-in overflow checking. Therefore, we do not need to use the SafeMath library.

## Credits

Images:

- Beeple, Everydays: The First 5000 Days. Sold for: $69.3 million Beeple/Christie’s
- (And all other images used in our client/assets folder)
