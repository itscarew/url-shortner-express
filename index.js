import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import redis from "redis";
import cors from "cors";
import urlRoutes from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const port = 5000;
const redisPort = 6379;

const app = express();
const db = `mongodb://127.0.0.1:27017/urlDB`;
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/shortenUrl", urlRoutes);

export const client = redis.createClient(redisPort);

client.connect();
client.on("connected", () => console.log("Redis connected"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
