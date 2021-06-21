//SHA 256 generates a 256 bit (64 character long) random sequence of letters and numbers (hash) out of any input. 
const SHA256 = require('crypto-js/sha256');
//key library
const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){

        if(signingKey.getPublic('hex') != this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;
        
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction')
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = '') {
        
        this.timestamp = timestamp;             //when block was created
        this.transactions = transactions;       //data associated with block (ex: transaction details)
        this.previousHash = previousHash;       //string that containes hash of previous block
        this.nonce = 0;                         //number only used once (authentication)
        this.hash = this.calculateHash()
}

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    //Proof of work (mining)
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

//Create Blockchain Constructor - array of blocks
class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    //Genesis Block
    createGenesisBlock() {
        return new Block("06/27/2021", "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    addTransaction(transaction){

        //check sender and recepient address
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain')
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                //subtract from sender
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                //add to reciever
                if(trans.toAddress === address) {
                    balance += trans.amount;
            }
        }
    }
    return balance;
}

    //Verifies Integrity by looping through entire chain
    isChainValid() {
        for(let i = 1; i < this.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            //check if current hash is invalid
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            //check if previous hash value is invalid
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        //If all hashes are correct then chain is valid
        return true;
    }

}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;