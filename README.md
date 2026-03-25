[![COTI Website](https://img.shields.io/badge/COTI%20WEBSITE-4CAF50?style=for-the-badge)](https://coti.io)
[![image](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.coti.io)
[![image](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.coti.io)
[![image](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.coti.io)
[![image](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.coti.io)

# COTI Privacy-Preserving Demo Applications

A collection of demonstration applications showcasing COTI's Multi-Party Computation (MPC) technology for privacy-preserving blockchain applications. Each demo illustrates different use cases of encrypted computation, from secure voting to private auctions.

## 🎯 Overview

These applications demonstrate how COTI's MPC technology enables confidential smart contracts where sensitive data remains encrypted throughout its entire lifecycle - during storage, computation, and transmission. Only authorized parties can decrypt specific results, ensuring complete privacy while maintaining blockchain transparency and verifiability.

## 📱 Demo Applications


### 🎯 Age Guessing Game
**Live Demo:** [https://age.demo.coti.io](https://age.demo.coti.io)  
**Source Code:** [/age](./age)

A decentralized game demonstrating privacy-preserving age verification. Players guess an admin's age through encrypted comparisons without ever seeing the actual value.

**Key Features:**
- Encrypted age storage on-chain
- Private comparison operations
- Interactive guessing interface
- Admin controls for game management

---

### 🏆 Private Auction
**Live Demo:** [https://auction.demo.coti.io](https://auction.demo.coti.io)  
**Source Code:** [/auction](./auction)

A sealed-bid auction system where bids remain completely confidential until the auction ends. Ensures fair price discovery without revealing sensitive bidding information to competitors.

**Key Features:**
- Encrypted bid submission and storage
- Private bid comparisons using MPC
- Automatic winner determination
- Fair settlement with token integration

---

### 💰 Millionaires' Problem
**Live Demo:** [https://millionaire.demo.coti.io](https://millionaire.demo.coti.io)  
**Source Code:** [/milionaire](./milionaire)

Implementation of Yao's classic Millionaires' Problem using COTI's Garbled Circuits. Two parties can determine who is wealthier without revealing their actual wealth values to each other.

**Key Features:**
- Secure multi-party comparison
- Encrypted wealth submission
- Privacy-preserving result computation
- Zero-knowledge proof of comparison

---

### 💰 Millionaires' Problem – Privacy on Demand (PoD)
**Source Code:** [/milionaire-pod](./milionaire-pod)

Same Millionaires' Problem example, built with **COTI Privacy on Demand (PoD)**. The contract and all user interactions (transactions, UI, explorer links) run on **Ethereum Sepolia**. The **privacy layer**—encryption via the PoD service and MPC comparison—runs on **COTI testnet**, so you get the same private comparison flow on an EVM testnet (Sepolia) with standard tools and Etherscan.

**Key Features:**
- Contract and transactions on Sepolia; privacy (encryption, MPC) on COTI testnet
- PoD encryption service (POD keys) for wealth inputs
- Same flow: submit encrypted wealth, compare, decrypt results per party

---

### 💰 Millionaires' Problem — unified UI (COTI or Sepolia)
**Source Code:** [/milionaire-merged](./milionaire-merged)

Single dev server with a **network dropdown** for **COTI Testnet** vs **Sepolia (PoD)**. UI and hooks are **vendored under** [`milionaire-merged/src`](./milionaire-merged/src) (shared components + two contract hooks). Configure `VITE_CONTRACT_ADDRESS_COTI_TESTNET` + `COTI_TESTNET_RPC_URL` and `VITE_CONTRACT_ADDRESS_SEPOLIA` + `SEPOLIA_RPC_URL`; see `milionaire-merged/.env.example`.

---

### 🗳️ Encrypted Voting
**Live Demo:** [https://vote.demo.coti.io](https://vote.demo.coti.io)  
**Source Code:** [/vote](./vote)

A privacy-preserving voting system where individual votes remain encrypted on-chain. Only aggregated results are revealed after the election closes, ensuring voter privacy while maintaining result accuracy.

**Key Features:**
- Encrypted vote storage using MPC
- Private vote tallying without revealing individual choices
- Voter authorization and access control
- Real-time election state management

