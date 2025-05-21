const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const TARGET = "https://u.expo.dev";

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: {
      "^/$": "/bb172799-1f45-4bb5-8291-0bff2b358673",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxying request:", req.method, req.url);
      console.log("Headers:", req.headers);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Proxied response:", proxyRes.statusCode, req.url);
    },
    selfHandleResponse: false,
    logLevel: "debug",
  })
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Proxy server running on port " + listener.address().port);
});
