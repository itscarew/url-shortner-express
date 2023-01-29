import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  originalUrl: {
    type: String,
    required: [true, "Url is required"],
  },
  shortUrl: { type: Schema.Types.ObjectId, ref: "UrlBank" },
});

export default mongoose.model(`Url`, UrlSchema);
