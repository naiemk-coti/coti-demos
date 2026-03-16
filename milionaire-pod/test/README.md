# MillionaireComparison Test Suite Documentation

## Overview

This directory contains tests for the MillionaireComparison smart contract, which implements Yao's Millionaires' Problem using COTI's Multi-Party Computation (MPC) technology. The tests include both local unit tests and COTI testnet integration tests.

## Test Files

### `MillionaireComparison.test.js`
Comprehensive contract functionality tests that cover:
- **Contract Initialization**: Verify Alice and Bob addresses, initial state, and deployment validation
- **State Management**: Test wealth set status tracking for both parties
- **Access Control**: Verify function accessibility and permissions for wealth submission and retrieval
- **Function Signatures**: Validate all function structures and parameters
- **Event Definitions**: Validate event structures and parameters
- **Error Handling**: Test proper error messages and reverts
- **View Function Behavior**: Test state-query functions
- **Edge Cases**: Handle multiple users, rapid calls, and edge scenarios
- **Contract Deployment**: Verify deployment with different participants
- **Gas Estimation**: Verify reasonable gas costs for view operations

## Running Tests

### Local Tests (Hardhat Network) - ✅ RECOMMENDED

```bash
npx hardhat test
```

**Result: 44 passing**

This runs all tests on the local Hardhat network and is the **primary test validation method**.

**What is tested:**
- ✅ Contract initialization with Alice and Bob addresses
- ✅ State management tests (isAliceWealthSet, isBobWealthSet, areBothWealthsSet)
- ✅ Access control verification for all functions
- ✅ Function signature validation
- ✅ Event definition checks
- ✅ Error message validation
- ✅ Contract deployment tests with different participants
- ✅ Gas estimation
- ✅ View function behavior
- ✅ Edge case scenarios

**What would require COTI testnet (not included in test suite):**
- Actual MPC encryption/decryption operations
- setAliceWealth and setBobWealth with real encrypted data
- compareWealth with encrypted wealth values
- getAliceResult and getBobResult decryption
- Wealth retrieval with actual encrypted data

**Note:** Some tests using `.connect()` and `estimateGas` are automatically skipped on COTI testnet due to RPC limitations, but all 44 tests pass on local network.

### COTI Testnet Tests - ⚠️ OPTIONAL

The test suite is designed to run primarily on local Hardhat network. If you want to run tests on COTI testnet to verify deployment and basic contract functionality:

1. **Set up environment variables** in `.env`:
   ```bash
   # COTI Testnet RPC URL
   VITE_APP_NODE_HTTPS_ADDRESS=https://testnet.coti.io/rpc

   # Alice Account (first party) - REQUIRED for testnet tests
   VITE_ALICE_PK=your_alice_private_key_here
   VITE_ALICE_AES_KEY=your_alice_aes_key_here

   # Bob Account (second party) - REQUIRED for testnet tests
   VITE_BOB_PK=your_bob_private_key_here
   VITE_BOB_AES_KEY=your_bob_aes_key_here

   # Deployer Account (for contract deployment) - OPTIONAL for tests
   DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here
   ```

   **Important**: The test suite requires at least `VITE_ALICE_PK` and `VITE_BOB_PK` to be configured in your `.env` file when running on COTI testnet. These are used to get signers for the Alice and Bob roles in the contract.

2. **Deploy the contract to COTI testnet**:
   ```bash
   npm run deploy:coti
   ```

3. **Run tests on COTI testnet**:
   ```bash
   npx hardhat test --network cotiTestnet
   ```

## Test Accounts

When running on COTI testnet, tests can use accounts from environment variables:
- **Alice** (VITE_ALICE_PK): First party in the millionaire comparison
- **Bob** (VITE_BOB_PK): Second party in the millionaire comparison

These accounts must have:
- Sufficient COTI testnet tokens for gas fees
- Properly configured AES keys for MPC operations

## Test Coverage

### Contract Initialization
- ✅ Alice's address set correctly on deployment
- ✅ Bob's address set correctly on deployment
- ✅ Initial state verification (no wealth set)
- ✅ Deployment validation (reject zero addresses)
- ✅ Deployment validation (Alice and Bob must be different)

### State Management
- ✅ Alice wealth set state tracking
- ✅ Bob wealth set state tracking
- ✅ Both wealths set state tracking
- ✅ State consistency across multiple callers
- ✅ State queries from any address

### Access Control - Wealth Submission
- ✅ Alice can view her own address
- ✅ Bob can view Alice's address
- ✅ Anyone can view participant addresses

### Access Control - Wealth Retrieval
- ✅ getAliceWealth() reverts when wealth not set
- ✅ getBobWealth() reverts when wealth not set

### Function Signatures
- ✅ Correct setAliceWealth signature
- ✅ Correct setBobWealth signature
- ✅ Correct compareWealth signature
- ✅ Correct getAliceResult signature
- ✅ Correct getBobResult signature
- ✅ Correct isAliceWealthSet signature
- ✅ Correct isBobWealthSet signature
- ✅ Correct areBothWealthsSet signature
- ✅ Correct getAliceWealth signature
- ✅ Correct getBobWealth signature
- ✅ Correct reset signature
- ✅ Correct getAliceAddress signature
- ✅ Correct getBobAddress signature

### Event Definitions
- ✅ WealthSubmitted event structure
- ✅ WealthSubmitted event parameters (user, role)
- ✅ ComparisonCompleted event structure
- ✅ ComparisonCompleted event parameters (requester)

### Error Handling
- ✅ "Alice's wealth not set yet" for getAliceWealth
- ✅ "Bob's wealth not set yet" for getBobWealth
- ✅ "Invalid addresses" for zero address deployment
- ✅ "Alice and Bob must be different" for same address deployment

### View Function Behavior
- ✅ Multiple calls to state check functions
- ✅ Multiple calls to address getters
- ✅ Consistent results across calls

### Edge Cases
- ✅ Rapid successive state checks
- ✅ Calls from different users for address queries
- ✅ State consistency across multiple checks

### Contract Deployment
- ✅ Correct bytecode deployment
- ✅ Valid contract address
- ✅ Multiple deployments with different participants

### Gas Estimation
- ✅ Reasonable gas costs for state check functions
- ✅ Reasonable gas costs for address getters

## MillionaireComparison Contract Functions

### State-Changing Functions

```solidity
// Alice submits her encrypted wealth
function setAliceWealth(itUint64 calldata wealth) external

// Bob submits his encrypted wealth
function setBobWealth(itUint64 calldata wealth) external

// Perform the comparison (can be called by Alice or Bob)
function compareWealth() external

// Reset the contract state (only Alice can call)
function reset() external
```

### View Functions

```solidity
// Check if Alice has submitted her wealth
function isAliceWealthSet() external view returns (bool)

// Check if Bob has submitted his wealth
function isBobWealthSet() external view returns (bool)

// Check if both parties have submitted their wealth
function areBothWealthsSet() external view returns (bool)

// Get Alice's encrypted comparison result (only Alice can call)
function getAliceResult() public view returns (ctUint8)

// Get Bob's encrypted comparison result (only Bob can call)
function getBobResult() public view returns (ctUint8)

// Get Alice's address
function getAliceAddress() external view returns (address)

// Get Bob's address
function getBobAddress() external view returns (address)

// Get Alice's encrypted wealth (requires wealth to be set)
function getAliceWealth() public view returns (ctUint64)

// Get Bob's encrypted wealth (requires wealth to be set)
function getBobWealth() public view returns (ctUint64)
```

### Events

```solidity
// Emitted when wealth is successfully submitted
event WealthSubmitted(address indexed user, string role)

// Emitted when comparison is completed
event ComparisonCompleted(address indexed requester)
```

## MPC Flow in MillionaireComparison

The MillionaireComparison contract implements Yao's Millionaires' Problem using COTI's MPC:

1. **Wealth Submission**:
   - Alice encrypts her wealth client-side → `itUint64`
   - Contract validates and stores as `utUint64` (encrypted)
   - Bob encrypts his wealth client-side → `itUint64`
   - Contract validates and stores as `utUint64` (encrypted)
   - Each wealth stored with respective owner's address for consistent encryption

2. **Comparison** (Simplified Boolean Logic):
   - Either Alice or Bob calls `compareWealth()`
   - Contract loads both wealth values as `gtUint64`
   - Performs just 2 MPC comparisons:
     - `aliceWins = MpcCore.gt(aliceWealth, bobWealth)`
     - `bobWins = MpcCore.gt(bobWealth, aliceWealth)`
   - Each result stored as `utBool` for the respective party

3. **Result Retrieval**:
   - Alice retrieves her encrypted `ctBool` result via `getAliceResult()`
   - Bob retrieves his encrypted `ctBool` result via `getBobResult()`
   - Each decrypts client-side with their AES key
   - Gets boolean: `true` = you're richer, `false` = you're not (or tie)
   - **If both get `false`, it's a tie**

4. **Privacy Guarantee**:
   - Neither party learns the other's actual wealth value
   - Both parties learn only if they are the richer one
   - All operations happen on encrypted data

## Running Specific Test Suites

Run specific test suites using grep:

```bash
# Test only initialization
npx hardhat test --grep "Contract Initialization"

# Test only access control
npx hardhat test --grep "Access Control"

# Test only error handling
npx hardhat test --grep "Error Handling"

# Test only state management
npx hardhat test --grep "State Management"

# Test only event definitions
npx hardhat test --grep "Event Definitions"
```

## Notes

- **Test Suite Focus**: Tests validate contract logic, state management, access control, and function signatures
- **Local Testing**: All 44 tests pass on local Hardhat network - this is the primary validation method
- **MPC Operations**: Actual MPC encryption/decryption operations are not included in the test suite
- **COTI Testnet**: Tests can run on COTI testnet but some tests using `.connect()` and `estimateGas` will skip due to RPC limitations
- **Gas Costs**: View functions have minimal gas costs; state-changing functions with MPC are more expensive

## Troubleshooting

### "Both parties must submit their wealth first" Errors

This is the correct behavior when:
- Trying to call compareWealth() before both Alice and Bob submit wealth
- This ensures the comparison only happens when both parties have submitted data

### "Alice's wealth not set yet" / "Bob's wealth not set yet" Errors

This is the correct behavior when:
- Trying to call getAliceWealth() before Alice submits her wealth
- Trying to call getBobWealth() before Bob submits his wealth

### "Pending Block is Not Available" Errors on COTI Testnet

This is a known COTI testnet network instability issue. The tests include retry logic to handle this:

**Symptoms:**
- Contract deployment fails with "pending block is not available"
- Tests fail in the `before` hook
- Error occurs during `estimateGas` or `waitForDeployment`

**Solutions:**
1. The tests automatically retry deployment up to 5 times with 3-second delays
2. If all retries fail, try running the tests again after a few minutes
3. Check COTI testnet status and network connectivity
4. Ensure you have sufficient testnet ETH for gas fees

**Note:** This is a network-level issue, not a problem with the tests or contract code. The vote and age project tests document similar issues.

## Test Structure

The test suite follows the pattern used in other COTI demo projects:
- Organized by functional areas
- Clear test descriptions
- Comprehensive coverage of edge cases
- Both positive and negative test cases
- Gas estimation checks
- Multiple user scenarios

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Add descriptive test names
3. Include both positive and negative cases
4. Consider edge cases and error conditions
5. Update this README with new test coverage

## References

- [COTI MPC Documentation](https://docs.coti.io/coti-v2-documentation/build-on-coti/mpc)
- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)
- [Yao's Millionaires' Problem](https://en.wikipedia.org/wiki/Yao%27s_Millionaires%27_problem)
