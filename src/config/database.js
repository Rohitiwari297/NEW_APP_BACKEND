import mongoose from "mongoose";
import config from "./config.js";

const connectDB = () => {
    mongoose
        .connect(config.MONGO_URI)

        .then((connectionInstance) => {
            console.log(`MongoDB Connencted: ${connectionInstance.connection.host}`)
        })

        .catch((err) => {
            console.error(
                "MongoDB connection error:",
                err
            );

            process.exit(1);
        })

}

export default connectDB;