const fs = require("fs");
const path = require("path");

// Define log file path
const logFilePath = path.join(__dirname, "log.txt");

// Function to write log
const writeLog = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Append to log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error("Error writing to log file:", err);
    });
};

// Example usage
    console.log(performance.now(),"This is a test log.");
writeLog("Another log entry.");
