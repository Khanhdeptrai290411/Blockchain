import Button from '@mui/material/Button';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const Injected = new InjectedConnector({
  supportedChainIds: [
    1, // Ethereum Mainnet
    0x539, // Dev Network on localhost:8545 via Ganache
  ],
});

const ConnectWallet = () => {
  const { account, chainId, activate, deactivate, active } = useWeb3React();
  return (
    <div>
      {active ? (
        <Button variant="outlined" onClick={() => deactivate()} color="success">
          ✅ Account {account.slice(0, 5)}... on chain {chainId}
        </Button>
      ) : (
        <Button variant="contained" onClick={() => activate(Injected)}>
          Connect to Metamask
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
