const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('7f49dc8ea56b9eb1be1ca8a59158fa424078fb6accdb9b3e9ef50594622a8d23');
const myWalletAddress = myKey.getPublic('hex');

let myCoin = new Blockchain();

//send 10 coins
const tx1 =  new Transaction(myWalletAddress, 'public key address', 10)
tx1.signTransaction(myKey);
myCoin.addTransaction(tx1);

//mines 100 coins
console.log('\nStarting miner...');
myCoin.minePendingTransactions(myKey.getPublic('hex'));


//balance shows 90
console.log('balance of my wallet is ', myCoin.getBalanceOfAddress(myKey.getPublic('hex')));


 