const { USERS, createGame, joinGame, makeMove, getGame, getBoard } = require('./multi-user');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scenario1() {
  console.log('=== Scenario 1: User1 vs User2 ===\n');
  
  console.log('1. User1 creates game...');
  const tx1 = await createGame('user1');
  console.log(`   TX: ${tx1}\n`);
  await sleep(2000);
  
  console.log('2. User2 joins game 1...');
  const tx2 = await joinGame('user2', 1);
  console.log(`   TX: ${tx2}\n`);
  await sleep(2000);
  
  console.log('3. User1 moves 21->28...');
  const tx3 = await makeMove('user1', 1, 21, 28);
  console.log(`   TX: ${tx3}\n`);
  await sleep(2000);
  
  console.log('4. User2 moves 42->35...');
  const tx4 = await makeMove('user2', 1, 42, 35);
  console.log(`   TX: ${tx4}\n`);
  await sleep(2000);
  
  console.log('5. User1 moves 23->30...');
  const tx5 = await makeMove('user1', 1, 23, 30);
  console.log(`   TX: ${tx5}\n`);
  
  console.log('✅ Scenario 1 complete!\n');
}

async function scenario2() {
  console.log('=== Scenario 2: User1 vs User3 ===\n');
  
  console.log('1. User1 creates game...');
  const tx1 = await createGame('user1');
  console.log(`   TX: ${tx1}\n`);
  await sleep(2000);
  
  console.log('2. User3 joins game 2...');
  const tx2 = await joinGame('user3', 2);
  console.log(`   TX: ${tx2}\n`);
  await sleep(2000);
  
  console.log('3. User1 moves 19->28...');
  const tx3 = await makeMove('user1', 2, 19, 28);
  console.log(`   TX: ${tx3}\n`);
  await sleep(2000);
  
  console.log('4. User3 moves 44->35...');
  const tx4 = await makeMove('user3', 2, 44, 35);
  console.log(`   TX: ${tx4}\n`);
  await sleep(2000);
  
  console.log('5. User1 moves 17->26...');
  const tx5 = await makeMove('user1', 2, 17, 26);
  console.log(`   TX: ${tx5}\n`);
  
  console.log('✅ Scenario 2 complete!\n');
}

async function scenario3() {
  console.log('=== Scenario 3: User2 vs User3 ===\n');
  
  console.log('1. User2 creates game...');
  const tx1 = await createGame('user2');
  console.log(`   TX: ${tx1}\n`);
  await sleep(2000);
  
  console.log('2. User3 joins game 3...');
  const tx2 = await joinGame('user3', 3);
  console.log(`   TX: ${tx2}\n`);
  await sleep(2000);
  
  console.log('3. User2 moves 21->28...');
  const tx3 = await makeMove('user2', 3, 21, 28);
  console.log(`   TX: ${tx3}\n`);
  await sleep(2000);
  
  console.log('4. User3 moves 40->33...');
  const tx4 = await makeMove('user3', 3, 40, 33);
  console.log(`   TX: ${tx4}\n`);
  await sleep(2000);
  
  console.log('5. User2 moves 28->37...');
  const tx5 = await makeMove('user2', 3, 28, 37);
  console.log(`   TX: ${tx5}\n`);
  
  console.log('✅ Scenario 3 complete!\n');
}

async function main() {
  console.log('🎮 Multi-User Checkers Interactions\n');
  console.log('Users:');
  console.log(`  User1: ${USERS.user1.address}`);
  console.log(`  User2: ${USERS.user2.address}`);
  console.log(`  User3: ${USERS.user3.address}\n`);
  
  try {
    await scenario1();
    await sleep(5000);
    
    await scenario2();
    await sleep(5000);
    
    await scenario3();
    
    console.log('🎉 All scenarios completed!');
    console.log('View transactions: https://explorer.hiro.so/address/SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC?chain=mainnet');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
