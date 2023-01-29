import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UrlBankSchema = new Schema({
  shortUrl: String,
});

export default mongoose.model(`UrlBank`, UrlBankSchema);
