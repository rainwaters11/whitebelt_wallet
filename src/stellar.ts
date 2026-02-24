import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';

// Environment connection variables
const HORIZON_URL = import.meta.env.VITE_STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Export the Horizon server instance for potential reuse
export const stellarServer = new Horizon.Server(HORIZON_URL);

/**
 * Ensures Freighter is available and requests access to the user's public key.
 * @returns The user's public key address.
 */
export const connectFreighter = async (): Promise<string> => {
    const hasFreighter = await isConnected();
    if (!hasFreighter) {
        throw new Error('Freighter is not installed. Please install the Freighter browser extension.');
    }

    const access = await requestAccess();
    if (access && access.address && !access.error) {
        return access.address;
    } else {
        throw new Error(access?.error || 'Failed to connect to Freighter wallet.');
    }
};

/**
 * Fetches the native XLM balance for a given Stellar public key.
 * Robustly handles 404 (unfunded) errors vs real network errors.
 * @param publicKey The Stellar public key to fetch the balance for.
 */
export const fetchNativeBalance = async (publicKey: string): Promise<string> => {
    try {
        const account = await stellarServer.loadAccount(publicKey);
        const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
        return nativeBalance ? nativeBalance.balance : '0.0000000';
    } catch (error: any) {
        if (error.response?.status === 404) {
            return 'Account not funded on Testnet';
        }
        throw new Error(`Network error fetching balance: ${error.message || 'Unknown error'}`);
    }
};

/**
 * Builds a payment transaction, signs it with Freighter, and submits it to Horizon.
 * Includes robust error parsing for Horizon transaction responses.
 * 
 * @param senderPubKey The sender's public key.
 * @param recipientPubKey The destination public key.
 * @param amount The amount of XLM to send (default '1').
 * @returns The transaction hash if successful.
 */
export const sendNativePayment = async (
    senderPubKey: string,
    recipientPubKey: string,
    amount: string = '1'
): Promise<string> => {
    try {
        // 1. Load the sender's account sequence number
        let account;
        try {
            account = await stellarServer.loadAccount(senderPubKey);
        } catch (e: any) {
            throw new Error(`Failed to load sender account. Make sure it is funded. (${e.message})`);
        }

        // 2. Build the payment transaction
        const transaction = new TransactionBuilder(account, {
            fee: '100', // standard base fee (stroops)
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                Operation.payment({
                    destination: recipientPubKey,
                    asset: Asset.native(),
                    amount: amount,
                })
            )
            .setTimeout(30)
            .build();

        // 3. Request signature from the Freighter extension
        const signedXdrResponse = await signTransaction(transaction.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        if (signedXdrResponse.error) {
            throw new Error(`User declined or signing failed: ${signedXdrResponse.error}`);
        }

        // 4. Submit the signed transaction to the local Horizon node
        const txToSubmit = TransactionBuilder.fromXDR(signedXdrResponse.signedTxXdr, NETWORK_PASSPHRASE) as any;
        const response = await stellarServer.submitTransaction(txToSubmit);

        if (response.successful) {
            return response.hash;
        } else {
            throw new Error('Transaction failed during submission.');
        }
    } catch (error: any) {
        // Parse detailed Horizon error codes when a transaction fails
        let errorMessage = error.message || 'An unknown error occurred during transaction submission.';

        if (error.response && error.response.data && error.response.data.extras) {
            const extras = error.response.data.extras;
            if (extras.result_codes) {
                const txCode = extras.result_codes.transaction;
                const opCodes = extras.result_codes.operations ? extras.result_codes.operations.join(', ') : 'none';
                errorMessage = `Horizon Error: tx=${txCode}, ops=[${opCodes}].`;
            } else {
                errorMessage = `Horizon Error: ${JSON.stringify(extras)}`;
            }
        }

        throw new Error(errorMessage);
    }
};
