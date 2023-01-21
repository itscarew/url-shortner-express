import express from "express";
import { urlShortener } from "../utils/urlShortner.js";
import Url from "../schema/url.schema.js";

const router = express.Router();

router.post(`/`, async (req, res) => {
  let newUrl = new Url();
  const shortUrl = urlShortener(req.body.originalUrl);
  newUrl.originalUrl = req.body.originalUrl;
  newUrl.shortnedUrl = shortUrl;
  try {
    const savedUrl = await newUrl.save();
    res.json({ message: "Url have been added", data: savedUrl });
  } catch (error) {
    res.send(error);
  }
});

router.get(`/:shortenUrl`, async (req, res) => {
  const oneUrl = await Url.findOne({
    shortnedUrl: req.params.shortenUrl,
  });
  try {
    res.json({ message: "Url have been found", data: oneUrl.originalUrl });
  } catch (error) {
    res.send(error);
  }
});

export default router;
