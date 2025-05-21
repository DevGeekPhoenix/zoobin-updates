const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const EXPO_PROJECT_ID = "/bb172799-1f45-4bb5-8291-0bff2b358673";

const TARGET = "https://u.expo.dev";

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      if (path.startsWith(EXPO_PROJECT_ID)) return path;

      if (path === "/" || path === "") return EXPO_PROJECT_ID;

      return `${EXPO_PROJECT_ID}${path}`;
    },
    logLevel: "debug",
  })
);

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Proxy server running on port " + listener.address().port);
});
