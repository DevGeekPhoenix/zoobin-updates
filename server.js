// server.js
const express = require("express");
const request = require("request");
const app = express();

const EXPO_UPDATE_URL =
  "https://u.expo.dev/bb172799-1f45-4bb5-8291-0bff2b358673";

app.use((req, res) => {
  const url = EXPO_UPDATE_URL + req.url;
  req
    .pipe(
      request({
        url,
        method: req.method,
        headers: {
          ...req.headers,
          host: "u.expo.dev",
        },
      })
    )
    .on("error", (err) => {
      res.status(500).send("Proxy Error: " + err.message);
    })
    .pipe(res);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Proxy server running on port " + listener.address().port);
});
