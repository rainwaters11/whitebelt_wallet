import { useState, useEffect } from 'react'
import { connectFreighter, fetchNativeBalance, sendNativePayment } from './stellar'
import './App.css'

function App() {
  const [pubKey, setPubKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [recipient, setRecipient] = useState('')
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<{ type: 'error' | 'success' | 'info', message: string } | null>(null)

  const checkConnection = async () => {
    try {
      // Opt out of auto-connecting on load to prevent spamming Freighter prompts
      // But we could silently check if already connected
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    checkConnection();
  }, [])

  const fetchBalance = async (publicKey: string) => {
    try {
      setLoading(true);
      const newBal = await fetchNativeBalance(publicKey);
      setBalance(newBal);
    } catch (e: any) {
      console.error("Error fetching balance:", e);
      setTxStatus({ type: 'error', message: 'Failed to fetch balance' });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true)
      setTxStatus(null)

      const address = await connectFreighter();
      setPubKey(address)
      await fetchBalance(address)
    } catch (e: any) {
      console.error(e)
      setTxStatus({ type: 'error', message: e.message || 'Error connecting to wallet' })
    } finally {
      setLoading(false)
    }
  }

  const sendXlm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pubKey) return
    if (!recipient) {
      setTxStatus({ type: 'error', message: 'Recipient public key is required' })
      return
    }

    try {
      setLoading(true)
      setTxStatus({ type: 'info', message: 'Building transaction and requesting signature from Freighter...' })

      const hash = await sendNativePayment(pubKey, recipient, '1')

      setTxStatus({ type: 'success', message: `Success! Hash: ${hash}` })
      setRecipient('')

      // Refresh the balance after a brief delay for ledger close
      setTimeout(() => fetchBalance(pubKey), 4000)

    } catch (e: any) {
      console.error(e)
      setTxStatus({ type: 'error', message: e.message || 'Transaction failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://stellar.org" target="_blank">
          <img src="https://stellar.org/favicon.ico" className="logo stellar" alt="Stellar logo" />
        </a>
      </div>
      <h1>Stellar Connect</h1>

      <div className="card">
        {!pubKey ? (
          <>
            <p>Connect your Freighter wallet to interact with the Stellar Testnet.</p>
            <button onClick={connectWallet} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </>
        ) : (
          <>
            <div className="dashboard-info">
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{pubKey.substring(0, 10)}...{pubKey.substring(pubKey.length - 4)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Balance</span>
                <span className="info-value">{balance !== null ? `${balance} XLM` : 'Loading...'}</span>
              </div>
            </div>

            <form onSubmit={sendXlm} className="send-form">
              <div className="input-group">
                <label htmlFor="recipient">Send 1 XLM To:</label>
                <input
                  id="recipient"
                  type="text"
                  autoComplete="off"
                  placeholder="G... Public Key"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading || !recipient}>
                {loading ? 'Processing...' : 'Send Transaction'}
              </button>
            </form>
          </>
        )}

        {txStatus && (
          <div className={`status-message ${txStatus.type}`}>
            {txStatus.message}
          </div>
        )}
      </div>
    </>
  )
}

export default App
