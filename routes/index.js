import express from "express";
import { cache, cachePostUrl, urlShortener } from "../utils/urlShortner.js";
import Url from "../schema/url.schema.js";
import { client } from "../index.js";

const router = express.Router();

router.get(`/`, async (req, res) => {
  try {
    const cachedUrls = await client.get("urlData");
    if (cachedUrls) {
      res.json({
        message: "All Url Found from redis",
        data: JSON.parse(cachedUrls),
      });
    } else {
      const allUrls = await Url.find();
      await client.setEx("urlData", 3600, JSON.stringify(allUrls));
      res.json({
        message: "All Url Found",
        data: allUrls,
      });
    }
  } catch (error) {
    res.send(error);
  }
});

router.post(`/`, cachePostUrl, async (req, res) => {
  try {
    let newUrl = new Url();

    const findUrl = await Url.findOne({
      originalUrl: req.body.originalUrl,
    });

    if (findUrl) {
      await client.setEx(req.body.originalUrl, 3600, JSON.stringify(findUrl));
      res.json({
        message: "We already have a shortenUrl for you",
        data: findUrl,
      });
    } else {
      const shortUrl = urlShortener();
      newUrl.originalUrl = req.body.originalUrl;
      newUrl.shortnedUrl = shortUrl;

      const savedUrl = await newUrl.save();
      await client.setEx(req.body.originalUrl, 3600, JSON.stringify(savedUrl));
      res.json({ message: "Url have been added", data: savedUrl });
    }
  } catch (error) {
    res.send(error);
  }
});

router.get(`/:shortenUrl`, cache, async (req, res) => {
  try {
    const oneUrl = await Url.findOne({
      shortnedUrl: req.params.shortenUrl,
    });
    await client.setEx(req.params.shortenUrl, 3600, oneUrl.originalUrl);
    res.json({ message: "Url have been found", data: oneUrl.originalUrl });
  } catch (error) {
    res.send(error);
  }
});

export default router;
