import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  originalUrl: {
    type: String,
    required: [true, "Url is required"],
  },
  shortnedUrl: String,
});

export default mongoose.model(`Url`, UrlSchema);
