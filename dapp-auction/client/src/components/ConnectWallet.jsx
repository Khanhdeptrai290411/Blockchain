import Button from '@mui/material/Button';
import { useEth } from '../contexts/EthContext';
import { useEffect, useState } from 'react';

const ConnectWallet = () => {
  const {
    state: { accounts, web3, networkID },
  } = useEth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      setIsConnecting(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // EthProvider will automatically detect the change via accountsChanged event
      // No need to reload page
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    // Note: MetaMask doesn't support disconnect, but we can clear local state
    // The user would need to disconnect from MetaMask extension directly
    alert('Please disconnect from MetaMask extension');
  };

  const isConnected = accounts && accounts.length > 0;
  const account = accounts?.[0];

  return (
    <div>
      {isConnected && account ? (
        <Button 
          variant="outlined" 
          onClick={handleDisconnect} 
          color="success"
          disabled={isConnecting}
        >
          ✅ Account {account.slice(0, 5)}...{account.slice(-4)} on chain {networkID || 'N/A'}
        </Button>
      ) : (
        <Button 
          variant="contained" 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Metamask'}
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
