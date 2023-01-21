import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import urlRoutes from "./routes/index.js";

const app = express();

const db = `mongodb://127.0.0.1:27017/urlDB`;
mongoose.connect(db);

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/shortenUrl", urlRoutes);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
