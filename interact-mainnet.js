const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, callReadOnlyFunction, cvToJSON } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

const MNEMONIC = "question issue hand aerobic outside upset merry armor tool alien blood end someone orient future flee now excess forward table basket life artist aspect";
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'checkers';

const network = new StacksTestnet();

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

async function interact() {
  console.log('=== Mainnet Contract Interactions ===\n');
  
  try {
    // Interaction 1-10: Read game states
    for (let i = 0; i < 10; i++) {
      console.log(`${i + 1}. Getting game ${i}...`);
      const game = await readContract('get-game', [uintCV(i)]);
      console.log(`   Result: ${game.value ? 'exists' : 'none'}\n`);
    }
    
    // Interaction 11: Get board for game 0
    console.log('11. Getting board for game 0...');
    const board = await readContract('get-board', [uintCV(0)]);
    console.log(`   Result: ${board.success ? 'retrieved' : 'none'}\n`);
    
    // Interaction 12: Get piece at position 1
    console.log('12. Getting piece at position 1...');
    const piece = await readContract('get-piece', [uintCV(0), uintCV(1)]);
    console.log(`   Result: ${piece.value}\n`);
    
    console.log('✅ Completed 12 read-only interactions!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

interact();
