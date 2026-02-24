# Stellar Connect Wallet 
A streamlined Web3 decentralized application (dApp) built for the Stellar Journey to Mastery: White Belt Challenge. This project demonstrates core fundamentals of Stellar development, including secure wallet integration, real-time account data fetching, and testnet transaction execution.

## Project Description
This dApp serves as a portal for users to interact with the Stellar Testnet. It provides a secure bridge to the Freighter Wallet, allowing users to authenticate, view their current XLM balances, and send testnet payments with real-time feedback.

**Key Features:**
- **Wallet Integration**: Seamless connection and disconnection via the Freighter Wallet API.
- **Balance Monitoring**: Real-time fetching of native XLM balances using the Stellar Horizon Testnet server.
- **Transaction Management**: Automated transaction building, signing, and submission for 1.0 XLM payments.
- **Live Feedback**: Instant UI updates providing transaction hashes and network status.

## ⚙️ Setup Instructions
Follow these steps to run the project locally on your machine.

**Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Freighter Wallet extension installed in your browser (set to Testnet mode).

**Installation**
Clone the repository:
```bash
git clone https://github.com/rainwaters11/stellar-connect-wallet.git
cd stellar-connect-wallet
```
Install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
Access the dApp: Open your browser to the local URL provided (usually http://localhost:5173).

## 📸 Submission Screenshots
Below is the visual evidence of the successful implementation of all Level 1 requirements.

### 1. Wallet Connected State
The application successfully interfaces with Freighter to retrieve and display the user's public key.
*(Reference: [Screenshot from 2026-02-24 02-50-36.png](./screenshots/Screenshot%20from%202026-02-24%2002-50-36.png))*

### 2. Balance Displayed
The dApp queries the Horizon Testnet to display the current native XLM balance accurately.
*(Reference: [Screenshot from 2026-02-24 02-51-08.png](./screenshots/Screenshot%20from%202026-02-24%2002-51-08.png))*

### 3. Successful Testnet Transaction
The transaction is built and sent to the Freighter wallet for a secure user signature.
*(Reference: [Screenshot from 2026-02-24 02-51-25.png](./screenshots/Screenshot%20from%202026-02-24%2002-51-25.png))*

### 4. Transaction Result & Hash
Confirmation of the successful transaction submission, including the unique transaction hash for verification on the Stellar Expert explorer.
*(Reference: [Screenshot from 2026-02-24 02-52-00.png](./screenshots/Screenshot%20from%202026-02-24%2002-52-00.png))*

## 🛠️ Built With
- **React** - Frontend Framework
- **Stellar SDK** - Blockchain Interaction
- **Freighter API** - Wallet Communication
- **Vite** - Build Tool
