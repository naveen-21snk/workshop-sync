import mongoose from "mongoose";
import path from "path";
import fs from "fs";

let isMongoConnected = false;
let dbStatusMessage = "Initializing database...";
let useLocalFallback = false;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    useLocalFallback = true;
    isMongoConnected = false;
    dbStatusMessage = "No MONGODB_URI found. Running in Local Sandbox File Mode.";
    console.log("⚠️  " + dbStatusMessage);
    return;
  }

  try {
    // Try to connect with a short timeout so we don't hang if the connection fails
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    useLocalFallback = false;
    dbStatusMessage = "Successfully connected to MongoDB Atlas.";
    console.log("🔌 " + dbStatusMessage);
  } catch (error) {
    isMongoConnected = false;
    useLocalFallback = true;
    dbStatusMessage = `Failed to connect to MongoDB Atlas (${error.message || error}). Running in Local Sandbox File Mode.`;
    console.log("⚠️  " + dbStatusMessage);
  }
}

export function getDbStatus() {
  return {
    connected: isMongoConnected,
    fallback: useLocalFallback,
    message: dbStatusMessage,
    type: isMongoConnected ? "MongoDB Atlas" : "Local Sandbox (JSON File)",
  };
}

// In-Memory / File system fallback storage implementation
const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "participants.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize participants file if it doesn't exist
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
}

// Core DB fallback helpers
export const LocalDB = {
  read() {
    try {
      if (!fs.existsSync(FILE_PATH)) {
        return [];
      }
      const data = fs.readFileSync(FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading fallback JSON database", err);
      return [];
    }
  },

  write(participants) {
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(participants, null, 2));
    } catch (err) {
      console.error("Error writing fallback JSON database", err);
    }
  }
};
