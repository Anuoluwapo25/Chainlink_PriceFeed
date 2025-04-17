// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockV3Aggregator {
    uint public decimal; 
    int public lastestprice;
    int public updatedprice;

    constructor(uint _decimal, int _initial) {
        decimal = _decimal;
        lastestprice = _initial;
    }

    function latestRoundData() 
        external
        view
        returns (
            uint roundId,
            int answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint answeredInRound
        ) {
           
            return (0, lastestprice, 0, 0, 0);
        }

    function updateAnswer( int _answer) external {
        lastestprice = _answer;
    }

}