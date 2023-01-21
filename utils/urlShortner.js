const obj = {};
export const urlShortener = (longURL = "") => {
  let shortURL = longURL.replace(/[^a-z]/g, "").slice(-4);
  return shortURL;
};
