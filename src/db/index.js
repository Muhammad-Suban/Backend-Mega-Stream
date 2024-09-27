import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${DB_NAME}`
    );
    console.log(
      `MONGO DB Connected || DB HOST || ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error in Database Connection |||", error);
    process.exit(1);
  }
};

export default dbConnection;
