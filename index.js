import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import redis from "redis";
import urlRoutes from "./routes/index.js";

const port = 5000;
const redisPort = 6379;

const app = express();
const db = `mongodb://127.0.0.1:27017/urlDB`;
mongoose.connect(db);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/shortenUrl", urlRoutes);

export const client = redis.createClient(redisPort);

client.connect();
// client.on("connected", () => console.log("Redis connected"));
// client.on("error", (err) => console.log("Redis Client Error", err));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
