// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import { PodMpcLib } from "@coti/pod-sdk/contracts/mpc/PodMpcLib.sol";
import { ctBool, ctUint64, itUint64 } from "@coti/pod-sdk/contracts/utils/mpc/MpcCore.sol";

/**
 * @title MillionaireComparisonPod
 * @notice Implements Yao's Millionaires' Problem using COTI PoD MPC (Privacy on Demand).
 * @dev Two parties (Alice and Bob) can compare their wealth without revealing the actual amounts.
 */
contract MillionaireComparisonPod is PodMpcLib {

    bytes32 public compareRequestIdAlice;
    bytes32 public compareRequestIdBob;

    // Store encrypted wealth values
    itUint64 private _aliceWealth;
    itUint64 private _bobWealth;
    
    // Track who has submitted their wealth
    bool private _aliceSet;
    bool private _bobSet;
    
    // Store comparison results for each party (true = you're richer)
    ctBool private _aliceResult;  // Result encrypted for Alice
    ctBool private _bobResult;    // Result encrypted for Bob
    bool public aliceResultReady;
    bool public bobResultReady;
    
    // Store addresses for consistent encryption
    address private _alice;
    address private _bob;
    
    // Events for tracking operations
    /// @notice Emitted when a party submits their encrypted wealth
    /// @param user The submitting address (Alice or Bob)
    /// @param isAlice True if the user is Alice, false if Bob
    event WealthSubmitted(address indexed user, bool isAlice);

    /// @notice Emitted when a comparison is requested once both wealths are set
    /// @param requester The address that triggered the comparison
    /// @param requestIdAlice MPC request id for Alice's result
    /// @param requestIdBob MPC request id for Bob's result
    event ComparisonRequested(
        address indexed requester,
        bytes32 requestIdAlice,
        bytes32 requestIdBob
    );

    /// @notice Emitted when an MPC result is written and marked ready
    /// @param user The beneficiary address whose result is now ready
    /// @param requestId The MPC request id associated with this result
    event ResultReady(address indexed user, bytes32 requestId);

    /// @notice Emitted when the contract state is reset
    event ComparisonReset();
    
    /**
     * @notice Initialize the contract with Alice and Bob addresses
     * @param alice Address of the first party (Alice)
     * @param bob Address of the second party (Bob)
     */
    constructor(address inbox, address mpcExecutor, uint256 cotiChainId, address alice, address bob) {
        require(alice != address(0) && bob != address(0), "Invalid addresses");
        require(alice != bob, "Alice and Bob must be different");
        
        _alice = alice;
        _bob = bob;
        _aliceSet = false;
        _bobSet = false;
        setInbox(inbox);
        configureCoti(mpcExecutor, cotiChainId);
    }

    /**
     * @notice Check if Alice has submitted her wealth
     */
    function isAliceWealthSet() external view returns (bool) {
        return _aliceSet;
    }

    /**
     * @notice Check if Bob has submitted his wealth
     */
    function isBobWealthSet() external view returns (bool) {
        return _bobSet;
    }

    /**
     * @notice Check if both parties have submitted their wealth
     */
    function areBothWealthsSet() external view returns (bool) {
        return _aliceSet && _bobSet;
    }

    /**
     * @notice Alice submits her encrypted wealth
     * @param wealth Encrypted input (itUint64) representing Alice's wealth
     */
    function setAliceWealth(itUint64 calldata wealth) external {
        require(msg.sender == _alice, "Only Alice can set her wealth");
        require(!_aliceSet, "Alice's wealth already set");
        
        _aliceWealth = wealth;
        _aliceSet = true;
        
        emit WealthSubmitted(msg.sender, true);
    }

    /**
     * @notice Bob submits his encrypted wealth
     * @param wealth Encrypted input (itUint64) representing Bob's wealth
     */
    function setBobWealth(itUint64 calldata wealth) external {
        require(msg.sender == _bob, "Only Bob can set his wealth");
        require(!_bobSet, "Bob's wealth already set");
        
        _bobWealth = wealth;
        _bobSet = true;
        
        emit WealthSubmitted(msg.sender, false);
    }

    /**
     * @notice Perform the comparison and store encrypted results for both parties
     * @dev Can be called by either Alice or Bob once both have submitted their wealth
     * @dev Result: true = you're richer, false = you're not (or tie)
     */
    function compareWealth() external {
        // Validation
        require(_aliceSet && _bobSet, "Both parties must submit their wealth first");

        // Perform comparison: ONLY check if Alice is richer
        // true  = Alice > Bob
        // false = Alice <= Bob
        compareRequestIdAlice = gt(
            _aliceWealth,
            _bobWealth,
            _alice,
            this.revealCallback.selector,
            this.onDefaultMpcError.selector);
        compareRequestIdBob = gt(
            _aliceWealth,
            _bobWealth,
            _bob,
            this.revealCallback.selector,
            this.onDefaultMpcError.selector);
        
        emit ComparisonRequested(msg.sender, compareRequestIdAlice, compareRequestIdBob);
    }

    function revealCallback(bytes memory data) external onlyInbox {
        bytes32 requestId = inbox.inboxSourceRequestId();
        ctBool result = abi.decode(data, (ctBool));
        if (requestId == compareRequestIdAlice) {
            _aliceResult = result;
            aliceResultReady = true;
            emit ResultReady(_alice, requestId);
        } else if (requestId == compareRequestIdBob) {
            _bobResult = result;
            bobResultReady = true;
            emit ResultReady(_bob, requestId);
        }
    }

    /**
     * @notice Returns the encrypted comparison result for Alice
     * @return The encrypted result as ctBool (true = Alice is richer, false = not richer or tie)
     */
    function getAliceResult() public view returns (ctBool) {
        require(msg.sender == _alice, "Only Alice can view her result");
        return _aliceResult;
    }

    /**
     * @notice Returns the encrypted comparison result for Bob
     * @return The encrypted result as ctBool (true = Bob is richer, false = not richer or tie)
     */
    function getBobResult() public view returns (ctBool) {
        require(msg.sender == _bob, "Only Bob can view his result");
        return _bobResult;
    }

    /**
     * @notice Returns Alice's address
     */
    function getAliceAddress() external view returns (address) {
        return _alice;
    }

    /**
     * @notice Returns Bob's address
     */
    function getBobAddress() external view returns (address) {
        return _bob;
    }

    /**
     * @notice Returns Alice's stored encrypted wealth value
     * @return The encrypted wealth ciphertext
     */
    function getAliceWealth() public view returns (ctUint64) {
        require(_aliceSet, "Alice's wealth not set yet");
        return _aliceWealth.ciphertext;
    }

    /**
     * @notice Returns Bob's stored encrypted wealth value
     * @return The encrypted wealth ciphertext
     */
    function getBobWealth() public view returns (ctUint64) {
        require(_bobSet, "Bob's wealth not set yet");
        return _bobWealth.ciphertext;
    }

    /**
     * @notice Reset the contract state (for testing purposes)
     * @dev Can only be called by Alice (contract initiator)
     */
    function reset() external {
        require(msg.sender == _alice, "Only Alice can reset the contract");
        _aliceSet = false;
        _bobSet = false;
        aliceResultReady = false;
        bobResultReady = false;
        emit ComparisonReset();
    }
}
