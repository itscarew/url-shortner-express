import express from "express";
import { cache, cachePostUrl, urlShortener } from "../utils/urlShortner.js";
import Url from "../schema/url.schema.js";
import { client } from "../index.js";
import cron from "node-cron";
import UrlBank from "../schema/urlBank.js";

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
    }).populate("shortUrl");
    if (findUrl) {
      await client.setEx(req.body.originalUrl, 3600, JSON.stringify(findUrl));
      res.json({
        message: "We already have a shortenUrl for you",
        data: findUrl,
      });
    } else {
      const shortUrl = urlShortener();
      const urlIds = [];
      const findShortenUrl = await Url.find();
      if (findShortenUrl) {
        findShortenUrl.map((a, k) => {
          urlIds.push(a.shortUrl);
        });

        const findUrlBank = await UrlBank.findOne({ _id: { $nin: urlIds } });
        newUrl.originalUrl = req.body.originalUrl;
        newUrl.shortUrl = findUrlBank._id;

        const savedUrl = await newUrl.save();
        const a = await savedUrl.populate("shortUrl");
        await client.setEx(req.body.originalUrl, 3600, JSON.stringify(a));
        res.json({ message: "Url have been added", data: a });
      }
    }
  } catch (error) {
    res.send(error);
  }
});

router.get(`/:shortUrl`, cache, async (req, res) => {
  try {
    const oneUrl = await Url.findOne({
      shortUrl: req.params.shortUrl,
    });
    await client.setEx(req.params.shortUrl, 3600, oneUrl.originalUrl);
    res.json({ message: "Url have been found", data: oneUrl.originalUrl });
  } catch (error) {
    res.send(error);
  }
});

//cron job every month
cron.schedule("* * 30 * *", () => {
  addShortUrls();
});

const addShortUrls = async () => {
  try {
    const urlToSave = [];
    for (let i = 0; i < 5; i++) {
      const shortUrl = urlShortener();
      urlToSave.push({ shortUrl: shortUrl });
    }
    if (urlToSave.length === 5) {
      await UrlBank.insertMany(urlToSave);
      console.log("added");
    }
  } catch (error) {
    res.send(error);
  }
};

export default router;
