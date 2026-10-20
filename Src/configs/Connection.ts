import dns from "dns";
import mongoose from "mongoose";
import environment from "./Environment";
const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(environment.dbUrl);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("error connecting to database");
  }
};

export default connectDB;
