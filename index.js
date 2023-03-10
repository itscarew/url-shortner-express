import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import redis from "redis";
import cors from "cors";
import urlRoutes from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;
const redisUrl = process.env.REDISPASSWORD;

const app = express();
const db = process.env.DB_PASSWORD;
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

export const client = redis.createClient({ url: redisUrl });

client.connect();
client.on("connected", () => console.log("Redis connected"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
