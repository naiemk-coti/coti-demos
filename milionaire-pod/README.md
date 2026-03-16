[![COTI Website](https://img.shields.io/badge/COTI%20WEBSITE-4CAF50?style=for-the-badge)](https://coti.io)
[![image](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.coti.io)
[![image](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.coti.io)
[![image](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.coti.io)
[![image](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.coti.io)


# Millionaires' Problem - COTI MPC Implementation

A decentralized implementation of **Yao's Millionaires' Problem** using COTI's Garbled Circuits (GC) and Multi-Party Computation (MPC) technology.


## 🌐 Live Demo

Experience the app live on the COTI Testnet: [https://millionaire.demo.coti.io](https://millionaire.demo.coti.io)


## 🎯 Overview

The Millionaires' Problem is a classic cryptographic challenge introduced by Andrew Yao in 1982. It demonstrates secure multi-party computation where two parties (Alice and Bob) can determine who is wealthier without revealing their actual wealth to each other.

### The Problem

- Alice has wealth **A**
- Bob has wealth **B**
- They want to know: **A > B**, **A < B**, or **A = B**
- **Constraint:** Neither Alice nor Bob should learn the other's actual wealth value

### Solution

This implementation uses COTI's privacy-preserving MPC technology deployed on the COTI testnet to:
- Encrypt wealth values using each party's private AES key
- Perform comparison operations on encrypted data
- Return encrypted results that only each party can decrypt
- Ensure no third party (including blockchain validators) can see the actual wealth values


## 🏗️ Architecture

### Smart Contract: `MillionaireComparison.sol`

The contract implements the following functionality:

1. **Initialization**: Contract is deployed with Alice and Bob's addresses
2. **Wealth Submission**: 
   - `setAliceWealth(itUint64 wealth)` - Alice submits encrypted wealth
   - `setBobWealth(itUint64 wealth)` - Bob submits encrypted wealth
3. **Comparison**: 
   - `compareWealth()` - Performs encrypted comparison using MPC
4. **Result Retrieval**:
   - `getAliceResult()` - Returns encrypted result for Alice to decrypt
   - `getBobResult()` - Returns encrypted result for Bob to decrypt

### Result Encoding

The comparison returns:
- `0` = Alice is richer
- `1` = Bob is richer
- `2` = Equal wealth


## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- COTI testnet account with test tokens
- Two separate wallets (one for Alice, one for Bob)


## 📦 Installation

### 1. Clone and Install

```bash
cd milionaire
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Coti Testnet RPC URL
VITE_APP_NODE_HTTPS_ADDRESS=https://testnet.coti.io/rpc

# Alice Account (First Millionaire)
VITE_ALICE_PK=your_alice_private_key
VITE_ALICE_AES_KEY=your_alice_aes_key

# Bob Account (Second Millionaire)
VITE_BOB_PK=your_bob_private_key
VITE_BOB_AES_KEY=your_bob_aes_key

# Deployer Account (for hardhat deployment)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

### 3. Compile the Smart Contract

```bash
npm run compile
```

### 4. Deploy to COTI Testnet

```bash
npm run deploy:coti
```

After deployment, copy the contract address and update your `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x...  # Your deployed contract address
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3001`


## 🚀 Quick Start

### Option 1: Use Existing Deployment

1. **Start the React application**

   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:3001`

2. **Open your browser**
   Navigate to `http://localhost:3001`

3. **Compare wealth**
   - The app connects to the deployed contract
   - Enter wealth values for Alice and Bob
   - Perform encrypted comparison
   - View results without revealing actual wealth values

### Option 2: Deploy Your Own Contract

See the [Installation](#installation) section for detailed deployment instructions.


## 📱 How to Use

### Step-by-Step Process

1. **Home Page**: 
   - Read about the Millionaires' Problem
   - **Alice's Panel**:
     - Enter Alice's wealth amount
     - Click "Submit" to encrypt and store on-chain
     - Click "Compare" to trigger the comparison
   - **Bob's Panel**:
     - Enter Bob's wealth amount
     - Click "Submit" to encrypt and store on-chain
     - Click "Compare" to trigger the comparison
   - **Results**:
     - Comparison results are displayed directly on the card
     - Each party can see the result (who is richer) without revealing specific amounts

### Important Notes

- Both Alice and Bob must submit their wealth before comparison can be performed
- Either party can trigger the comparison once both values are submitted
- The actual wealth values remain encrypted throughout the entire process
- Each party can only decrypt their own result


## 🏗 Project Architecture

```
milionaire/
├── contracts/
│   └── MillionaireComparison.sol    # Main smart contract
├── scripts/
│   └── deploy-MillionaireComparison.js  # Deployment script
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── GlobalBackground.jsx
│   │   └── styles.js
│   ├── config/
│   │   └── theme.js             # Theme configuration
│   ├── hooks/
│   │   └── useMillionaireContract.js  # Contract interaction hook
│   ├── pages/
│   │   ├── HomePage.jsx         # Main application page (Alice & Bob panels)
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── hardhat.config.js            # Hardhat configuration
├── vite.config.js               # Vite configuration
├── package.json
└── README.md
```


## 🔧 Available Scripts

### Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run compile` - Compile smart contracts
- `npm run deploy:coti` - Deploy to COTI testnet

### Testing the Contract

You can test with different scenarios:

1. **Alice is richer**: Alice enters 2,000,000, Bob enters 1,000,000
2. **Bob is richer**: Alice enters 1,000,000, Bob enters 2,000,000
3. **Equal wealth**: Alice enters 1,500,000, Bob enters 1,500,000


## 🔐 Smart Contract Features

### MillionaireComparison Contract

The contract implements the following functionality:

1. **Initialization**: Contract is deployed with Alice and Bob's addresses
2. **Wealth Submission**: 
   - `setAliceWealth(itUint64 wealth)` - Alice submits encrypted wealth
   - `setBobWealth(itUint64 wealth)` - Bob submits encrypted wealth
3. **Comparison**: 
   - `compareWealth()` - Performs encrypted comparison using MPC
4. **Result Retrieval**:
   - `getAliceResult()` - Returns encrypted result for Alice to decrypt
   - `getBobResult()` - Returns encrypted result for Bob to decrypt

### Result Encoding

The comparison returns:
- `0` = Alice is richer
- `1` = Bob is richer
- `2` = Equal wealth

### MPC Operations

The contract uses COTI's MPC Core library for:
- `validateCiphertext()` - Validates encrypted inputs
- `onBoard()` - Loads encrypted values for computation
- `offBoardCombined()` - Stores encrypted results
- `gt()` - Greater than comparison on encrypted values
- `mux()` - Conditional selection on encrypted values
- `and() / not()` - Logical operations on encrypted values


## 🔐 Privacy & Security

### Encryption

- **User-side encryption**: Wealth values are encrypted using each user's AES key before being sent to the contract
- **On-chain encryption**: Contract stores encrypted values using COTI's `utUint64` type (combined user + network ciphertext)
- **Result encryption**: Comparison results are encrypted specifically for each party

### MPC Operations

The contract uses COTI's MPC Core library for:
- `validateCiphertext()` - Validates encrypted inputs
- `onBoard()` - Loads encrypted values for computation
- `offBoardCombined()` - Stores encrypted results
- `gt()` - Greater than comparison on encrypted values
- `mux()` - Conditional selection on encrypted values
- `and() / not()` - Logical operations on encrypted values

### Privacy Guarantees

- ✅ Alice cannot see Bob's wealth
- ✅ Bob cannot see Alice's wealth
- ✅ Blockchain validators cannot see either wealth value
- ✅ Contract cannot leak wealth information
- ✅ Only the comparison result is revealed to both parties


## 🔍 Troubleshooting

### Common Issues

1. **Contract not configured error**
   - Ensure you've copied `.env.example` to `.env`
   - Verify contract address is set in `.env`
   - Check that the contract address is valid

2. **Wallet not configured error**
   - Verify private keys and AES keys are set for Alice and Bob
   - Ensure private keys don't include the `0x` prefix

3. **Transaction failures**
   - Ensure wallets have sufficient COTI for gas fees
   - Check network configuration (Chain ID: 7082400)
   - Verify you're connected to COTI Testnet

4. **Build errors**
   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js version is 16 or higher

### Getting Test COTI

To get test COTI for Testnet:

1. Visit the [COTI Discord](https://discord.com/invite/Z4r8D6ez49)
2. Navigate to the testnet faucet channel
3. Request test tokens for your wallet address


## Technical Deep Dive - MPC Implementation

### Understanding the Millionaires' Problem Implementation

This section provides a technical deep dive into how the Millionaires' Problem is implemented using COTI's Multi-Party Computation (MPC) technology.


## Core Concepts

### 1. Garbled Circuits (GC)

COTI uses Yao's Garbled Circuits protocol for secure computation:
- **Input Privacy:** Each party's inputs remain encrypted throughout computation
- **Output Privacy:** Only authorized parties can decrypt the final result
- **Computational Security:** Based on cryptographic assumptions

### 2. Data Types

#### Input Types (Client-side)
- `itUint64` - Input ciphertext from user (encrypted with user's AES key)

#### Garbled Types (On-chain computation)
- `gtUint64` - Garbled/encrypted uint64 for computation
- `gtUint8` - Garbled/encrypted uint8 for computation  
- `gtBool` - Garbled/encrypted boolean for computation

#### User Types (Storage)
- `utUint64` - Combined user + network ciphertext (storage format)
- `utUint8` - Combined user + network ciphertext (storage format)

#### Output Types (Return values)
- `ctUint64` - User-specific ciphertext for decryption
- `ctUint8` - User-specific ciphertext for decryption


## Smart Contract Architecture

### State Variables

```solidity
utUint64 private _aliceWealth;    // Alice's encrypted wealth
utUint64 private _bobWealth;      // Bob's encrypted wealth
utUint8 private _aliceResult;     // Result encrypted for Alice
utUint8 private _bobResult;       // Result encrypted for Bob
bool private _aliceSet;           // Has Alice submitted?
bool private _bobSet;             // Has Bob submitted?
address private _alice;           // Alice's address
address private _bob;             // Bob's address
```

### Key Functions

#### 1. Wealth Submission (Alice)

```solidity
function setAliceWealth(itUint64 calldata wealth) external
```

**Process:**
1. Validate the caller is Alice
2. Validate the encrypted input using `MpcCore.validateCiphertext(wealth)`
3. Convert to garbled type: `gtUint64 gtWealth`
4. Store as combined ciphertext: `MpcCore.offBoardCombined(gtWealth, _alice)`

**Why offBoardCombined?**
- Creates a ciphertext that can be decrypted by Alice
- Adds network-level encryption for additional security
- Enables on-chain storage while maintaining privacy

#### 2. Wealth Submission (Bob)

```solidity
function setBobWealth(itUint64 calldata wealth) external
```

Same process as Alice, but with Bob's address and storage location.

#### 3. The Comparison Function

This is where the magic happens! Let's break it down:

```solidity
function compareWealth() external
```

**Step 1: Load Encrypted Values**

```solidity
gtUint64 aliceWealth = MpcCore.onBoard(_aliceWealth.ciphertext);
gtUint64 bobWealth = MpcCore.onBoard(_bobWealth.ciphertext);
```

`onBoard()` converts stored ciphertexts back to garbled types for computation.

**Step 2: Perform Comparisons**

```solidity
gtBool aliceGreater = MpcCore.gt(aliceWealth, bobWealth);  // Alice > Bob?
gtBool bobGreater = MpcCore.gt(bobWealth, aliceWealth);    // Bob > Alice?
```

These comparisons happen **on encrypted data**! The blockchain validators cannot see the actual values.

**Step 3: Encode Results**

We need to encode three possible outcomes:
- `0` = Alice is richer (aliceWealth > bobWealth)
- `1` = Bob is richer (bobWealth > aliceWealth)
- `2` = Equal wealth (neither is greater)

```solidity
gtUint8 zero = MpcCore.setPublic8(0);
gtUint8 one = MpcCore.setPublic8(1);
gtUint8 two = MpcCore.setPublic8(2);
```

**Step 4: Conditional Logic with MPC**

This is the clever part! We use `mux` (multiplexer) for conditional selection:

```solidity
// If Alice > Bob, result = 0, else result = 1
gtUint8 tempResult = MpcCore.mux(aliceGreater, one, zero);

// If Bob > Alice, result = 1, else keep tempResult
gtUint8 finalResult = MpcCore.mux(bobGreater, tempResult, one);

// Check if neither is greater (they're equal)
gtBool neitherGreater = MpcCore.and(
    MpcCore.not(aliceGreater),
    MpcCore.not(bobGreater)
);

// If equal, result = 2, else keep result
finalResult = MpcCore.mux(neitherGreater, finalResult, two);
```

**Understanding MPC.mux(condition, falseValue, trueValue):**
- If condition is true → returns trueValue
- If condition is false → returns falseValue
- **All encrypted!** The actual condition is never revealed

**Step 5: Store Encrypted Results**

```solidity
_aliceResult = MpcCore.offBoardCombined(finalResult, _alice);
_bobResult = MpcCore.offBoardCombined(finalResult, _bob);
```

Each party gets their own encrypted copy of the result.

#### 4. Result Retrieval

```solidity
function getAliceResult() public view returns (ctUint8) {
    require(msg.sender == _alice, "Only Alice can view her result");
    return _aliceResult.userCiphertext;
}
```

Returns the user-specific ciphertext that only Alice can decrypt.


## Client-Side Operations (React Hook)

### Encryption

```javascript
const encryptedValue = await wallet.encryptValue(
  BigInt(wealth),
  contractAddress,
  selector
);
```

**Parameters:**
- `BigInt(wealth)` - The plaintext value
- `contractAddress` - Address of the smart contract
- `selector` - Function selector (identifies which function will use this value)

**Output:** `itUint64` - Input ciphertext ready for contract

### Decryption

```javascript
const clearResult = await wallet.decryptValue(ctResult);
```

**Input:** `ctUint8` - Encrypted result from contract
**Output:** `BigInt` - Decrypted result (0, 1, or 2)


## Security Analysis

### What is Protected?

✅ **Alice's wealth value** - Never revealed in plaintext
✅ **Bob's wealth value** - Never revealed in plaintext
✅ **Intermediate computation results** - All encrypted
✅ **Which party triggered comparison** - Public info (but doesn't matter)

### What is Revealed?

❌ **Comparison result** - Both parties learn who is richer
❌ **That a comparison occurred** - Visible on blockchain
❌ **Participant addresses** - Public (Alice and Bob's addresses)

### Why is This Secure?

1. **Computational Security:**
   - Based on AES-256 encryption
   - Relies on hardness of breaking symmetric encryption

2. **Protocol Security:**
   - Uses Yao's Garbled Circuits
   - Proven secure in semi-honest model

3. **Network Security:**
   - COTI's MPC network validates computations
   - Multiple nodes participate without learning secrets

4. **Smart Contract Security:**
   - Access controls prevent unauthorized access
   - Results are encrypted for specific users only


## MPC Core Functions Reference

### Conversion Functions

- `validateCiphertext(itUintX)` - Validates and converts input to garbled type
- `onBoard(ctUintX)` - Converts stored ciphertext to garbled type
- `offBoardCombined(gtUintX, address)` - Creates user+network combined ciphertext

### Arithmetic Operations

- `add(gtUintX, gtUintX)` - Addition
- `sub(gtUintX, gtUintX)` - Subtraction
- `mul(gtUintX, gtUintX)` - Multiplication

### Comparison Operations

- `gt(gtUintX, gtUintX)` - Greater than (>)
- `lt(gtUintX, gtUintX)` - Less than (<)
- `eq(gtUintX, gtUintX)` - Equal (==)
- `ne(gtUintX, gtUintX)` - Not equal (!=)

### Boolean Operations

- `and(gtBool, gtBool)` - Logical AND
- `or(gtBool, gtBool)` - Logical OR
- `not(gtBool)` - Logical NOT
- `xor(gtBool, gtBool)` - Logical XOR

### Control Flow

- `mux(gtBool, gtValue, gtValue)` - Multiplexer (conditional select)

### Constant Creation

- `setPublic8(uint8)` - Create public constant as gtUint8
- `setPublic16(uint16)` - Create public constant as gtUint16
- `setPublic32(uint32)` - Create public constant as gtUint32
- `setPublic64(uint64)` - Create public constant as gtUint64


## Performance Considerations

### Gas Costs

**Approximate gas usage:**
- `setAliceWealth()`: ~200,000 gas
- `setBobWealth()`: ~200,000 gas
- `compareWealth()`: ~500,000 gas
- `getAliceResult()`: ~50,000 gas (view function)

### Transaction Times

- **Submit wealth:** ~5-10 seconds (depends on network)
- **Perform comparison:** ~10-15 seconds (MPC computation)
- **Read result:** Instant (view function)


## Limitations and Considerations

### Current Implementation

1. **One-time comparison:** After comparison, contract needs reset for new values
2. **Two-party only:** Designed specifically for Alice and Bob
3. **Integer comparison:** Supports whole numbers only
4. **Public result:** Both parties learn the same comparison outcome

### Potential Enhancements

1. **Multiple rounds:** Allow resetting and comparing again
2. **Multi-party:** Extend to N millionaires
3. **Range queries:** "Is wealth above/below threshold?"
4. **Approximate comparison:** Add noise to protect against edge cases


## 🔧 Technology Stack

### Smart Contract Layer

- **Solidity**: ^0.8.19
- **COTI MPC Library**: `@coti-io/coti-contracts`
- **Hardhat**: Development framework
- **Network**: COTI Testnet (Chain ID: 7082400)

### Frontend Layer

- **React**: ^18.2.0
- **React Router DOM**: ^6.22.0
- **Styled Components**: ^6.1.8
- **Vite**: ^5.0.0
- **COTI-Ethers SDK**: `@coti-io/coti-ethers`
- **Ethers.js**: ^6.0.0

### Key Dependencies

- **@coti-io/coti-contracts**: MPC operations (MpcCore)
- **@coti-io/coti-ethers**: Wallet encryption/decryption utilities


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## 🔗 Links

- [COTI Documentation](https://docs.coti.io/)
- [COTI Contracts Examples](https://github.com/coti-io/coti-contracts-examples)
- [Yao's Millionaires' Problem on Wikipedia](https://en.wikipedia.org/wiki/Yao%27s_Millionaires%27_problem)
- [COTI Testnet Explorer](https://testnet.cotiscan.io/)


## 📄 License

MIT


