import express from "express";
import { cache, cachePostUrl, urlShortener } from "../utils/urlShortner.js";
import Url from "../schema/url.schema.js";
import { client } from "../index.js";
import cron from "node-cron";
import UrlBank from "../schema/urlBank.schema.js";
import UrlLength from "../schema/urlLength.schema.js";

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
      const allUrls = await Url.find().populate("shortUrl");
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
  const length = await UrlLength.findOne();
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
      const urlIds = [];
      const findShortenUrl = await Url.find();
      if (findShortenUrl) {
        findShortenUrl.map((a, k) => {
          urlIds.push(a.shortUrl);
        });

        const findUrlBank = await UrlBank.findOne({ _id: { $nin: urlIds } });
        if (!findUrlBank) {
          const shortUrl = urlShortener(length.length);
          let newUrlBank = new UrlBank();
          newUrlBank.shortUrl = shortUrl;

          const savedUrlBank = await newUrlBank.save();

          newUrl.originalUrl = req.body.originalUrl;
          newUrl.shortUrl = savedUrlBank._id;

          const savedUrl = await newUrl.save();
          const populatedSavedUrl = await savedUrl.populate("shortUrl");
          await client.setEx(
            req.body.originalUrl,
            3600,
            JSON.stringify(populatedSavedUrl)
          );
          res.json({
            message: "Url and Url Bank have been added",
            data: populatedSavedUrl,
          });
        } else {
          newUrl.originalUrl = req.body.originalUrl;
          newUrl.shortUrl = findUrlBank._id;

          const savedUrl = await newUrl.save();
          const populatedSavedUrl = await savedUrl.populate("shortUrl");
          await client.setEx(
            req.body.originalUrl,
            3600,
            JSON.stringify(populatedSavedUrl)
          );
          res.json({ message: "Url have been added", data: populatedSavedUrl });
        }
      }
    }
  } catch (error) {
    res.send(error);
  }
});

router.get(`/:shortUrl`, cache, async (req, res) => {
  try {
    const findUrlBank = await UrlBank.findOne({
      shortUrl: req.params.shortUrl,
    });
    const oneUrl = await Url.findOne({
      shortUrl: findUrlBank._id,
    });
    await client.setEx(req.params.shortUrl, 3600, oneUrl.originalUrl);
    res.json({ message: "Url have been found", data: oneUrl.originalUrl });
  } catch (error) {
    res.send(error);
  }
});

router.post(`/urlBanks`, async (req, res) => {
  try {
    await addShortUrls();
    res.json({ message: "Url Banks added" });
  } catch (error) {
    res.send(error);
  }
});

router.post(`/urlLength`, async (req, res) => {
  let newUrlLength = new UrlLength();
  newUrlLength.length = req.body.length;

  await newUrlLength.save();
  res.json({ message: "Url Lenght Added added" });
});

router.delete(`/`, async (req, res) => {
  try {
    await Url.deleteMany({});
    res.json({ message: "Url's Deleted" });
  } catch (error) {
    res.send(error);
  }
});

router.delete(`/urlBanks`, async (req, res) => {
  try {
    await UrlBank.deleteMany({});
    res.json({ message: "Url Banks Deleted" });
  } catch (error) {
    res.send(error);
  }
});

//cron job every month
cron.schedule("0 10 1 * *", () => {
  addShortUrls();
});

const addShortUrls = async () => {
  const length = await UrlLength.findOne();
  try {
    const urlToSave = [];
    for (let i = 0; i < 5; i++) {
      const shortUrl = urlShortener(length.length);
      urlToSave.push({ shortUrl: shortUrl });
    }
    if (urlToSave.length === 30) {
      await UrlBank.insertMany(urlToSave);
    }
  } catch (error) {
    throw error;
  }
};

export default router;
