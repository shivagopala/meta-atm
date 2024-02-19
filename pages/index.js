import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  // SIP calculator state variables
  const [investmentPeriodYears, setInvestmentPeriodYears] = useState(0);
  const [monthlyInvestmentAmount, setMonthlyInvestmentAmount] = useState(0);
  const [expectedAnnualReturns, setExpectedAnnualReturns] = useState(0);
  const [totalSipReturn, setTotalSipReturn] = useState(0);

  // State variable to toggle visibility of projected SIP returns
  const [showProjectedReturns, setShowProjectedReturns] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  // SIP Calculator functions
  const calculateSipReturn = () => {
    const totalMonths = investmentPeriodYears * 12;
    const monthlyInterestRate = expectedAnnualReturns / 12 / 100;
    let futureValue = 0;

    for (let i = 1; i <= totalMonths; i++) {
      futureValue += monthlyInvestmentAmount * ((1 + monthlyInterestRate) ** i);
    }

    setTotalSipReturn(futureValue.toFixed(2));
  };

  // Function to toggle visibility of projected SIP returns
  const toggleProjectedReturns = () => {
    setShowProjectedReturns(!showProjectedReturns);
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>
        <p>SIP Calculator</p>
        <label>
          Investment Period (Years):
          <input type="number" value={investmentPeriodYears} onChange={(e) => setInvestmentPeriodYears(parseInt(e.target.value))} />
        </label>
        <br />
        <label>
          Monthly Investment Amount (ETH):
          <input type="number" value={monthlyInvestmentAmount} onChange={(e) => setMonthlyInvestmentAmount(parseInt(e.target.value))} />
        </label>
        <br />
        <label>
          Expected Annual Returns (%):
          <input type="number" value={expectedAnnualReturns} onChange={(e) => setExpectedAnnualReturns(parseInt(e.target.value))} />
        </label>
        <br />
        <button onClick={calculateSipReturn}>Calculate SIP Return</button>
        <p>Total SIP Return: {totalSipReturn}</p>
        <button onClick={toggleProjectedReturns}>Show Projected SIP Returns</button>
        {showProjectedReturns && (
          <div>
            <p>Projected SIP returns for various time durations [@12%]</p>
            <table>
              <thead>
                <tr>
                  <th>Duration</th>
                  <th>SIP Amount (₹)</th>
                  <th>Future Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 year</td>
                  <td>100</td>
                  <td>0 Lakhs</td>
                </tr>
                <tr>
                  <td>5 years</td>
                  <td>100</td>
                  <td>0.1 Lakhs</td>
                </tr>
                <tr>
                  <td>8 years</td>
                  <td>100</td>
                  <td>0.2 Lakhs</td>
                </tr>
                <tr>
                  <td>10 years</td>
                  <td>100</td>
                  <td>0.2 Lakhs</td>
                </tr>
                <tr>
                  <td>12 years</td>
                  <td>100</td>
                  <td>0.3 Lakhs</td>
                </tr>
                <tr>
                  <td>15 years</td>
                  <td>100</td>
                  <td>0.5 Lakhs</td>
                </tr>
                <tr>
                  <td>18 years</td>
                  <td>100</td>
                  <td>0.8 Lakhs</td>
                </tr>
                <tr>
                  <td>20 years</td>
                  <td>100</td>
                  <td>1 Lakhs</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      {account ? (
        <div>
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
        </div>
      ) : (
        <button onClick={connectAccount}>Connect Metamask Wallet</button>
      )}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
