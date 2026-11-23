import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — messages will not be stored in a database.");
    return false;
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  return true;
}

export const isDBConnected = () => mongoose.connection.readyState === 1;
