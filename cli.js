const { USERS, createGame, joinGame, makeMove, getGame, getBoard } = require('./multi-user');

const args = process.argv.slice(2);
const action = args[0];
const user = args[1];
const gameId = parseInt(args[2]);
const from = parseInt(args[3]);
const to = parseInt(args[4]);

async function main() {
  if (!action || !user) {
    console.log('Usage:');
    console.log('  node cli.js create <user>');
    console.log('  node cli.js join <user> <gameId>');
    console.log('  node cli.js move <user> <gameId> <from> <to>');
    console.log('  node cli.js read <gameId>');
    console.log('\nUsers: user1, user2, user3');
    console.log(`  user1: ${USERS.user1.address}`);
    console.log(`  user2: ${USERS.user2.address}`);
    console.log(`  user3: ${USERS.user3.address}`);
    return;
  }

  try {
    if (action === 'create') {
      console.log(`Creating game as ${user}...`);
      const tx = await createGame(user);
      console.log(`✅ TX: ${tx}`);
      console.log(`View: https://explorer.hiro.so/txid/${tx}?chain=mainnet`);
    }
    else if (action === 'join') {
      console.log(`${user} joining game ${gameId}...`);
      const tx = await joinGame(user, gameId);
      console.log(`✅ TX: ${tx}`);
      console.log(`View: https://explorer.hiro.so/txid/${tx}?chain=mainnet`);
    }
    else if (action === 'move') {
      console.log(`${user} moving ${from}->${to} in game ${gameId}...`);
      const tx = await makeMove(user, gameId, from, to);
      console.log(`✅ TX: ${tx}`);
      console.log(`View: https://explorer.hiro.so/txid/${tx}?chain=mainnet`);
    }
    else if (action === 'read') {
      console.log(`Reading game ${user}...`);
      const game = await getGame(parseInt(user));
      console.log('Game state:', JSON.stringify(game, null, 2));
      const board = await getBoard(parseInt(user));
      console.log('Board:', JSON.stringify(board, null, 2));
    }
    else {
      console.log('❌ Unknown action:', action);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
