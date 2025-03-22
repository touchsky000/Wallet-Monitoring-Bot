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

        const signatures = await connection.getSignaturesForAddress(walletAddress, {
            limit: 5
        });

        if (signatures.length === 0) {
            console.log("No recent transactions found.");
            return;
        }

        const latestSignature = signatures[0].signature;

        console.log(performance.now(), " timer 1 ")
        const transactionDetails = await connection.getTransaction(
            latestSignature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        console.log(performance.now(), " timer 2 ")

        if (!transactionDetails) {
            console.log("Transaction not found.");
            return;
        }
        if (transactionDetails.meta && transactionDetails.meta.err === null) {
            const { postTokenBalances, preTokenBalances } = transactionDetails.meta

            if (postTokenBalances[0].mint == "So11111111111111111111111111111111111111112") {
                console.log(performance.now(), `\x1b[32m✔\x1b[0m Buy Signature: ${latestSignature}`);
                writeLog(`Buy Signature: ${latestSignature}`);
            }
            else {
                console.log(performance.now(), `\x1b[32m✔\x1b[0m Sell Signature: ${latestSignature}`);
                writeLog(`Sell Signature: ${latestSignature}`);
            }

            for (let i = 0; i < 2; i++) {
                console.log(performance.now(), postTokenBalances[i].mint)
                writeLog(postTokenBalances[i].mint)
                console.log(performance.now(), postTokenBalances[i].uiTokenAmount.uiAmount - preTokenBalances[i].uiTokenAmount.uiAmount)
                writeLog(postTokenBalances[i].uiTokenAmount.uiAmount - preTokenBalances[i].uiTokenAmount.uiAmount)
            }

            console.log("\n")
            writeLog("\n")
        } else {
            console.log(performance.now(), `❌ Transaction Failed! Signature: ${latestSignature}`);
            await writeLog(`❌ Transaction Failed! Signature: ${latestSignature}`)
            // await writeLog(`token => ${transactionDetails.meta.postTokenBalances[0].mint}`)
            const { postTokenBalances, preTokenBalances } = transactionDetails.meta
            for (let i = 0; i < 2; i++) {
                console.log(performance.now(), postTokenBalances[i].mint)
                writeLog(postTokenBalances[i].mint)
                console.log(performance.now(), postTokenBalances[i].uiTokenAmount.uiAmount - preTokenBalances[i].uiTokenAmount.uiAmount)
                writeLog(postTokenBalances[i].uiTokenAmount.uiAmount - preTokenBalances[i].uiTokenAmount.uiAmount)
            }
        }

    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }
};

const WALLET_ADDRESS = new PublicKey("3qN8UGqZWJaGZBrdg2j2qpYeDxkFRFKvtyEuUeABsjWJ");
// const WALLET_ADDRESS = new PublicKey("47Q5EGo2uxoXiDJBAj3Ur1v7XGY6e3b6Wnj9REKuAGnf");
// const WALLET_ADDRESS = new PublicKey("8npRzAb6SupcpSbnusPA1MMdAuizBoAWv4L6Tj1bwUoJ");
connection.onAccountChange(WALLET_ADDRESS, async () => {
    console.log(performance.now(), "Wallet Updated: Checking latest transaction...");
    await checkRecentTransaction(WALLET_ADDRESS);
});