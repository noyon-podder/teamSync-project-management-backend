import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connect to mongo database 🕺💃");
  } catch (error) {
    console.log("Error connection to Mongo Database");
    process.exit(1);
  }
};

export default connectDatabase;
