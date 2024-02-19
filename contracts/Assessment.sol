// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    struct SIPReturn {
        uint256 duration;
        uint256 sipAmount;
        uint256 futureValue;
    }

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // SIP Calculator function
    function calculateSIPReturn(uint256 monthlyInvestmentAmount, uint256 investmentPeriodYears, uint256 expectedAnnualReturns) public pure returns (uint256) {
        uint256 totalMonths = investmentPeriodYears * 12;
        uint256 futureValue = 0;
        uint256 monthlyInterestRate = expectedAnnualReturns / 12 / 100;

        for (uint256 i = 1; i <= totalMonths; i++) {
            futureValue += monthlyInvestmentAmount * ((1 + monthlyInterestRate) ** i);
        }

        return futureValue;
    }

    // Function to show projected returns for various time durations
    function getProjectedReturns() public pure returns (SIPReturn[] memory) {
        SIPReturn[] memory projectedReturns = new SIPReturn[](8);

        projectedReturns[0] = SIPReturn(1, 100, 0);
        projectedReturns[1] = SIPReturn(5, 100, 100000);
        projectedReturns[2] = SIPReturn(8, 100, 200000);
        projectedReturns[3] = SIPReturn(10, 100, 200000);
        projectedReturns[4] = SIPReturn(12, 100, 300000);
        projectedReturns[5] = SIPReturn(15, 100, 500000);
        projectedReturns[6] = SIPReturn(18, 100, 800000);
        projectedReturns[7] = SIPReturn(20, 100, 1000000);

        return projectedReturns;
    }
}
