const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, callReadOnlyFunction, cvToJSON } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const MNEMONIC = "rare glow wheel hole illness undo split twelve skull awful dish install flower toy shock narrow lake immense ancient label barely unusual certain victory";
const CONTRACT_ADDRESS = 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
const CONTRACT_NAME = 'checkers';
const network = new StacksMainnet();

async function readContract(functionName, args = []) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs: args,
    network,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

async function createGame(privateKey) {
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
  
  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
}

async function interact() {
  console.log('=== Mainnet Contract Interactions ===\n');
  console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}\n`);
  
  const wallet = await generateWallet({ secretKey: MNEMONIC, password: '' });
  const account = wallet.accounts[0];
  const address = getStxAddress({ account, transactionVersion: 1 });
  
  console.log(`Wallet: ${address}\n`);
  
  try {
    console.log('1. Creating new game...');
    const tx = await createGame(account.stxPrivateKey);
    console.log(`   TX: ${tx.txid}`);
    console.log(`   View: https://explorer.hiro.so/txid/${tx.txid}?chain=mainnet\n`);
    
    console.log('2. Reading game 0...');
    const game = await readContract('get-game', [uintCV(0)]);
    console.log(`   Result:`, game, '\n');
    
    console.log('3. Reading board for game 0...');
    const board = await readContract('get-board', [uintCV(0)]);
    console.log(`   Pieces found: ${board.success ? 'yes' : 'no'}\n`);
    
    console.log('✅ Interactions complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

interact();
