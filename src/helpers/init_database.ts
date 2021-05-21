import mongoose from "mongoose";
import Logger from "./logger";
import { DB_PATH, DB_NAME } from "./constants";

mongoose.connect(DB_PATH, {
  dbName: DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

mongoose.connection.on("connected", () => {
  Logger.log("MongoDB Connected");
  Logger.log(
    "No. of Listeners: " + mongoose.connection.listenerCount("connected")
  );
});

mongoose.connection.on("error", (err) => {
  Logger.log(err?.message);
});

mongoose.connection.on("disconnected", () => {
  Logger.log("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  Logger.log("Closing database connections");
  await mongoose.connection.close();
});
