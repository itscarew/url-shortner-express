import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UrlLengthSchema = new Schema({
  length: Number,
});

export default mongoose.model(`UrlLength`, UrlLengthSchema);
