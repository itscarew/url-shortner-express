import cryptoRandomString from "crypto-random-string";
import { client } from "../index.js";
export const urlShortener = (longURL = "") => {
  const shortURL = cryptoRandomString({ length: 3, type: "url-safe" });
  return shortURL;
};

//Cache MiddleWare
export const cache = async (req, res, next) => {
  try {
    const shortenUrl = req.params.shortenUrl;
    const cachedUrl = await client.get(shortenUrl);
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
