# mock-dai-wallet-dapp
A simple wallet DApp for a mock coin (ERC20 token) built using Truffle, Solidity and ReactJs 

## Steps to run the dapp
1. git clone https://github.com/Harshiv07/mock-dai-wallet-dapp.git
2. npm i
3. truffle compile
4. Create a ganache project and add the truffle config file of this project to it
5. truffle migrate
6. npm start

The DAI coin made in this project is an implementation of the ERC20 Token. Current features of this wallet:
* Send and receive mock DAI token
* Dynamically update the UI after the transaction is completed
* View the past events from log and display the transactions of that user 
