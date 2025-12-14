# Demo scripts

## Setup

```bash
ganache
(0) 0x1b2e8627182f3aafb256da70f3e80c153815ec8f21359ec4095cd748b53c77f4
(1) 0x11f8314006a5a050fe45e55e0810993608ec36352233f2832995b1a0b81878ff
(2) 0x2f00afc6d3e05fd8769f3cf5366a1699356cb5746f097d79966c7d478124d346
cd truffle
truffle migrate --network development
truffle exec scripts/seed.js
```

## 1

```bash
cd client
npm start
```

## 2

```bash
cd truffle
npx truffle console --network development
const nft = await MintNFT.deployed()
nft.address
let res = await nft.mint('https://gateway.pinata.cloud/ipfs/QmZ5YDGxnAjtHB6apV2wAiRUAcAXeNsNfsaSHPjosGnTZT')
let tokenId = res.receipt.logs[0].args.tokenId.words[0]
tokenId

await nft.ownerOf(tokenId)
```

## 3

```bash
await nft.ownerOf(tokenId)

truffle exec scripts/cronEndAuction.js

```
