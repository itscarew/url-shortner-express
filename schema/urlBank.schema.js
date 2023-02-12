import mongoose from "mongoose";
import { PaC } from "../utils/pandc.js";
import UrlLength from "./urlLength.schema.js";

const Schema = mongoose.Schema;

const UrlBankSchema = new Schema({
  shortUrl: String,
});

UrlBankSchema.post("insertMany", async function (doc, next) {
  const length = await UrlLength.findOne();
  const UrlBankCount = await mongoose
    .model(`UrlBank`, UrlBankSchema)
    .countDocuments();

  if (UrlBankCount + 20 >= PaC(length.length)) {
    length.length = length.length + 1;
    await length.save();
    next();
  } else {
    next();
  }
});

export default mongoose.model(`UrlBank`, UrlBankSchema);
