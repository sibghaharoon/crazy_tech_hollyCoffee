import dns from "dns";
import mongoose from "mongoose";
import environment from "./environment";
const connectDB = async () => {
  try {
    dns.setServers(environment.dnsServers);
    await mongoose.connect(environment.dbUrl);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default connectDB;
