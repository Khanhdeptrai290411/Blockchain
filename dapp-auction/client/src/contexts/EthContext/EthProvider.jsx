import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import Web3 from 'web3';
import EthContext from './EthContext';
import { actions, initialState, reducer } from './state';

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const balanceFetchRef = useRef(0);

  const init = useCallback(async (artifact) => {
  if (!artifact) return;

  const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
  const accounts = await web3.eth.requestAccounts();

  // Lấy cả chainId và networkId để debug
  const chainId = await web3.eth.getChainId();
  const netId = await web3.eth.net.getId();

  // Candidate IDs để tìm đúng key trong artifact.networks
  const candidates = [
    chainId,
    netId,
    chainId === 1337 ? 5777 : null, // map Ganache chainId->network_id phổ biến
    netId === 1337 ? 5777 : null,
    chainId === 5777 ? 1337 : null,
    netId === 5777 ? 1337 : null,
  ].filter((x) => x !== null);

  console.log("[EthProvider] chainId:", chainId, "netId:", netId);
  console.log("[EthProvider] artifact networks keys:", Object.keys(artifact.networks || {}));
  console.log("[EthProvider] trying candidates:", candidates);

  const { abi } = artifact;

  let usedId = null;
  let address = null;
  let contract = null;

  for (const id of candidates) {
    const deployed = artifact.networks?.[id];
    if (deployed?.address) {
      usedId = id;
      address = deployed.address;
      contract = new web3.eth.Contract(abi, address);
      break;
    }
  }

  if (!contract) {
    console.error(
      "[EthProvider] Cannot find deployed address in artifact.networks for any candidate ID.",
      { chainId, netId, artifactNetworks: Object.keys(artifact.networks || {}) }
    );
  } else {
    console.log("[EthProvider] Using networkID:", usedId, "address:", address);
  }

  dispatch({
    type: actions.init,
    data: { artifact, web3, accounts, networkID: usedId ?? netId, contract },
  });

  // fetch balance once after init
  try {
    const balWei = await web3.eth.getBalance(accounts[0]);
    const balEth = web3.utils.fromWei(balWei, 'ether');
    dispatch({ type: actions.setBalance, data: { balanceEth: balEth } });
  } catch (e) {
    console.warn('[EthProvider] failed to fetch balance', e);
  }
}, []);

  const refreshBalance = useCallback(async () => {
    if (!state.web3 || !state.accounts || state.accounts.length === 0) return;
    // avoid overlapping fetches
    const current = ++balanceFetchRef.current;
    try {
      const balWei = await state.web3.eth.getBalance(state.accounts[0]);
      if (balanceFetchRef.current !== current) return;
      const balEth = state.web3.utils.fromWei(balWei, 'ether');
      dispatch({ type: actions.setBalance, data: { balanceEth: balEth } });
    } catch (e) {
      console.warn('[EthProvider] refreshBalance failed', e);
    }
  }, [state.web3, state.accounts]);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require('../../contracts/AuctionFactory.json');
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ['chainChanged', 'accountsChanged'];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return ( 
    <EthContext.Provider
      value={{
        state,
        dispatch,
        refreshBalance,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
