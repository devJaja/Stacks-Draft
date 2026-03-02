const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');

const MNEMONIC = "rare glow wheel hole illness undo split twelve skull awful dish install flower toy shock narrow lake immense ancient label barely unusual certain victory";
const TARGET_ADDRESS = "SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC";
const network = new StacksMainnet();

async function deployToMainnet() {
  console.log('=== Deploying Checkers to Mainnet ===\n');
  
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: '',
  });
  
  const account = wallet.accounts[0];
  const address = getStxAddress({ account, transactionVersion: 1 });
  
  console.log('Wallet address:', address);
  console.log('Target address:', TARGET_ADDRESS);
  
  if (address !== TARGET_ADDRESS) {
    console.log('\n❌ Mnemonic does not match target address');
    console.log('Expected:', TARGET_ADDRESS);
    console.log('Got:', address);
    return;
  }
  
  console.log('✅ Address verified!\n');
  console.log('Deploying from:', address);
  
  const contractCode = fs.readFileSync('./contracts/checkers.clar', 'utf8');
  
  const txOptions = {
    contractName: 'checkers',
    codeBody: contractCode,
    senderKey: account.stxPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 500000, // 0.5 STX
  };
  
  try {
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    console.log('\n✅ Contract deployed!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('View on explorer:', `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);
    console.log(`\nContract address: ${address}.checkers`);
    console.log('View contract:', `https://explorer.hiro.so/address/${address}?chain=mainnet`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

deployToMainnet();
