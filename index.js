const { Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const connection = new Connection("https://rpc.shyft.to/?api_key=RBbl_MnaXSzVwAFg", "confirmed");
const logFilePath = path.join(__dirname, "log.txt");

const writeLog = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error("Error writing to log file:", err);
    });
};

const checkRecentTransaction = async (walletAddress) => {
    try {
        // Get recent confirmed transactions
        const signatures = await connection.getSignaturesForAddress(walletAddress, { limit: 5 });
        
        if (signatures.length === 0) {
            console.log("No recent transactions found.");
            return;
        }
        
        // Fetch transaction details for the latest signature
        const latestSignature = signatures[0].signature;
        const transactionDetails = await connection.getTransaction(
            latestSignature, 
            { commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
            });
            
            if (!transactionDetails) {
                console.log("Transaction not found.");
                return;
            }
            // console.log("latest transaction =>", transactionDetails)
            if (transactionDetails.meta && transactionDetails.meta.err === null) {
                console.log(`✅ Transaction Successful! Signature: ${latestSignature}`);
            } else {
                console.log(`❌ Transaction Failed! Signature: ${latestSignature}`, transactionDetails.meta);
                writeLog(`❌ Transaction Failed! Signature: ${latestSignature}`)
                writeLog(transactionDetails)
            }
            
        } catch (error) {
            console.error("Error fetching transaction details:", error);
        }
    };
    
const WALLET_ADDRESS = new PublicKey("8npRzAb6SupcpSbnusPA1MMdAuizBoAWv4L6Tj1bwUoJ");
    connection.onAccountChange(WALLET_ADDRESS, async () => {
        console.log("Wallet Updated: Checking latest transaction...");
        await checkRecentTransaction(WALLET_ADDRESS);
});
