import cryptoRandomString from "crypto-random-string";
import { client } from "../index.js";
import UrlLengthSchema from "../schema/urlLength.schema.js";

export const urlShortener = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const shortURL = cryptoRandomString({ length, characters });
  return shortURL;
};

//Cache MiddleWare
export const cache = async (req, res, next) => {
  try {
    const shortUrl = req.params.shortUrl;
    const cachedUrl = await client.get(shortUrl);
    if (cachedUrl !== null) {
      res.json({ message: "Url have been found from redis", data: cachedUrl });
    } else {
      next();
    }
  } catch (error) {
    throw error;
  }
};

//Cache MiddleWare
export const cachePostUrl = async (req, res, next) => {
  try {
    const originalUrl = req.body.originalUrl;
    const cachedUrl = await client.get(originalUrl);
    if (cachedUrl !== null) {
      res.json({
        message: "Shorten Url for you from redis",
        data: JSON.parse(cachedUrl),
      });
    } else {
      next();
    }
  } catch (error) {
    throw error;
  }
};
