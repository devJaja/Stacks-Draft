const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, callReadOnlyFunction, cvToJSON } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const CONTRACT_ADDRESS = 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
const CONTRACT_NAME = 'checkers';
const network = new StacksMainnet();

const USERS = {
  user1: {
    mnemonic: 'rare glow wheel hole illness undo split twelve skull awful dish install flower toy shock narrow lake immense ancient label barely unusual certain victory',
    address: 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC'
  },
  user2: {
    mnemonic: 'question issue hand aerobic outside upset merry armor tool alien blood end someone orient future flee now excess forward table basket life artist aspect',
    address: 'SP2DWWDVSSKZ5X37BBV3RV0GY0A0FFZZESYHEVQZ9'
  },
  user3: {
    mnemonic: 'envelope stick gossip permit regular leader coyote hybrid fiscal rookie pear shoulder magnet traffic leopard broken release chair canal force game great display salute',
    address: 'SP39B34TC4DB3MDA9TYXHDEYB0DYMSFH5XF5K6A96'
  }
};

async function getPrivateKey(mnemonic) {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  return wallet.accounts[0].stxPrivateKey;
}

async function createGame(userKey) {
  const privateKey = await getPrivateKey(USERS[userKey].mnemonic);
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-game',
    functionArgs: [],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 200000,
  };
  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction(tx, network);
  return result.txid;
}

async function joinGame(userKey, gameId) {
  const privateKey = await getPrivateKey(USERS[userKey].mnemonic);
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'join-game',
    functionArgs: [uintCV(gameId)],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 200000,
  };
  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction(tx, network);
  return result.txid;
}

async function makeMove(userKey, gameId, from, to) {
  const privateKey = await getPrivateKey(USERS[userKey].mnemonic);
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'move',
    functionArgs: [uintCV(gameId), uintCV(from), uintCV(to)],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 200000,
  };
  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction(tx, network);
  return result.txid;
}

async function getGame(gameId) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-game',
    functionArgs: [uintCV(gameId)],
    network,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

async function getBoard(gameId) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-board',
    functionArgs: [uintCV(gameId)],
    network,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

module.exports = { USERS, createGame, joinGame, makeMove, getGame, getBoard };
