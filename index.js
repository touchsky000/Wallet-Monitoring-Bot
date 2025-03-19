const {
    Connection,
    PublicKey
} = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const connection = new Connection("https://rpc.shyft.to/?api_key=RBbl_MnaXSzVwAFg", "confirmed");
const logFilePath = path.join(__dirname, "log.txt");

const writeLog = async (message) => {
    const timestamp = new Date().toISOString();

    // Ensure message is a string (if it's JSON, stringify it)
    const logMessage = `[${timestamp}] ${typeof message === "object" ? JSON.stringify(message, null, 2) : message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error("Error writing to log file:", err);
    });
};

const checkRecentTransaction = async (walletAddress) => {
    try {
        // Get recent confirmed transactions
        const signatures = await connection.getSignaturesForAddress(walletAddress, {
            limit: 5
        });

        if (signatures.length === 0) {
            console.log("No recent transactions found.");
            return;
        }

        // Fetch transaction details for the latest signature
        const latestSignature = signatures[0].signature;
        const transactionDetails = await connection.getTransaction(
            latestSignature, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
            });

        if (!transactionDetails) {
            console.log("Transaction not found.");
            return;
        }
        if (transactionDetails.meta && transactionDetails.meta.err === null) {
            console.log(`\x1b[32m✔\x1b[0m Transaction Successful! Signature: ${latestSignature}`);
            // writeLog(`\x1b[32m✔\x1b[0m Transaction Successful! Signature: ${latestSignature}`)
            // writeLog(transactionDetails.meta.postTokenBalances[0].mint)
        } else {
            console.log(`❌ Transaction Failed! Signature: ${latestSignature}`);
            await writeLog(`❌ Transaction Failed! Signature: ${latestSignature}`)
            await writeLog(`token => ${transactionDetails.meta.postTokenBalances[0].mint}`)
        }

    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }
};

// const WALLET_ADDRESS = new PublicKey("47Q5EGo2uxoXiDJBAj3Ur1v7XGY6e3b6Wnj9REKuAGnf");
const WALLET_ADDRESS = new PublicKey("8npRzAb6SupcpSbnusPA1MMdAuizBoAWv4L6Tj1bwUoJ");
connection.onAccountChange(WALLET_ADDRESS, async () => {
    console.log("Wallet Updated: Checking latest transaction...");
    await checkRecentTransaction(WALLET_ADDRESS);
});