import React, { Component } from "react";
import daiLogo from "../dai-logo.png";
import "./App.css";
import Web3 from "web3";
import DaiTokenMock from "../abis/DaiTokenMock.json";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    this.setState({ loading: true });
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const daiTokenAddress = "0xBA0B9c8240F2F219a608527F9F9AD442ABf19832"; // Replace DAI Address Here
    const daiTokenMock = new web3.eth.Contract(
      DaiTokenMock.abi,
      daiTokenAddress
    );
    this.setState({ daiTokenMock: daiTokenMock });
    const balance = await daiTokenMock.methods
      .balanceOf(this.state.account)
      .call();
    this.setState({ balance: web3.utils.fromWei(balance.toString(), "Ether") });
    const transactions = await daiTokenMock.getPastEvents("Transfer", {
      fromBlock: 0,
      toBlock: "latest",
      filter: { from: this.state.account },
    });
    this.setState({ transactions: transactions });
    this.setState({ loading: false });
    console.log(transactions);
  }

  async transfer(recipient, amount) {
    this.setState({ loading: true });
    const web3 = window.web3;
    await this.state.daiTokenMock.methods
      .transfer(recipient, amount)
      .send({ from: this.state.account }, async (error, transactonHash) => {
        console.log("Submitted transaction with hash: ", transactonHash);
        let transactionReceipt = null;
        while (transactionReceipt == null) {
          // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await web3.eth.getTransactionReceipt(
            transactonHash
          );
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log("Got the transaction receipt: ", transactionReceipt);
        const final_balance = await this.state.daiTokenMock.methods
          .balanceOf(this.state.account)
          .call();
        console.log("Ending balance is:", final_balance);
        console.log("Recipient:", this.state.recipient);
        const transactions = await this.state.daiTokenMock.getPastEvents(
          "Transfer",
          {
            fromBlock: 0,
            toBlock: "latest",
            filter: { from: this.state.account },
          }
        );
        this.setState({
          balance: web3.utils.fromWei(final_balance.toString(), "Ether"),
        });
        this.setState({ transactions: transactions });
        this.setState({ loading: false });
      });
  }

  async sendToken() {
    const recipient = this.state.recipient;
    const amount = window.web3.utils.toWei(this.state.amount, "Ether");
    this.setState({ recipient: "", amount: "" });
    await this.transfer(recipient, amount);
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      daiTokenMock: null,
      balance: 0,
      transactions: [],
      loading: false,
      recipient: "",
      amount: "",
    };

    this.transfer = this.transfer.bind(this);
    this.sendToken = this.sendToken.bind(this);
  }

  render() {
    return (
      <div>
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            className='navbar-brand col-sm-3 col-md-2 mr-0'
            href='/'
            target='_blank'
            rel='noopener noreferrer'
          >
            DAI Mock Wallet
          </a>
        </nav>
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex text-center'>
              <div
                className='content mr-auto ml-auto'
                style={{ width: "500px" }}
              >
                <a href='/' target='_blank' rel='noopener noreferrer'>
                  <img src={daiLogo} width='150' />
                </a>
                {!this.loading ? (
                  <h1>{this.state.balance} DAI</h1>
                ) : (
                  <h1>Loading</h1>
                )}
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    this.sendToken();
                  }}
                >
                  <div className='form-group mr-sm-2'>
                    <input
                      id='recipient'
                      type='text'
                      value={this.state.recipient}
                      onChange={event =>
                        this.setState({
                          recipient: event.target.value,
                        })
                      }
                      className='form-control'
                      placeholder='Recipient Address'
                      required
                    />
                  </div>
                  <div className='form-group mr-sm-2'>
                    <input
                      id='amount'
                      type='text'
                      value={this.state.amount}
                      onChange={event =>
                        this.setState({
                          amount: event.target.value,
                        })
                      }
                      className='form-control'
                      placeholder='Amount'
                      required
                    />
                  </div>
                  <button type='submit' className='btn btn-primary btn-block'>
                    Send
                  </button>
                </form>
                <table className='table'>
                  <thead>
                    <tr>
                      <th scope='col'>Recipient</th>
                      <th scope='col'>value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!this.loading ? (
                      this.state.transactions.map((tx, key) => {
                        return (
                          <tr key={key}>
                            <td>{tx.returnValues.to}</td>
                            <td>
                              {window.web3.utils.fromWei(
                                tx.returnValues.value.toString(),
                                "Ether"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr key='0'>
                        <td>Loading</td>
                        <td>Loading</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
