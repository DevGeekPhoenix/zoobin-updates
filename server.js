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
      console.log("--- Incoming path:", path);
      if (path.startsWith(EXPO_PROJECT_ID)) {
        console.log("--- Already prefixed, sending:", path);
        return path;
      }
      if (path === "/" || path === "") {
        console.log("--- Rewriting root to:", EXPO_PROJECT_ID);
        return EXPO_PROJECT_ID;
      }
      const rewritten = `${EXPO_PROJECT_ID}${path}`;
      console.log("--- Rewriting", path, "to", rewritten);
      return rewritten;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader(
          "expo-runtime-version",
          req.headers["expo-runtime-version"]
        );
        proxyReq.setHeader("expo-platform", req.headers["expo-platform"]);
        proxyReq.setHeader(
          "expo-channel-name",
          req.headers["expo-channel-name"]
        );
        proxyReq.setHeader("accept", req.headers["accept"] || "*/*");
        // Optionally set user-agent to mimic curl
        proxyReq.setHeader("user-agent", "curl/7.88.1");
        // Remove potentially problematic headers
        proxyReq.removeHeader("accept-encoding");
        proxyReq.removeHeader("connection");
        proxyReq.removeHeader("x-forwarded-for");
        proxyReq.removeHeader("x-forwarded-host");
        proxyReq.removeHeader("x-forwarded-proto");
        proxyReq.removeHeader("x-railway-request-id");
        proxyReq.removeHeader("x-railway-edge");
        proxyReq.removeHeader("x-real-ip");
        proxyReq.removeHeader("x-request-start");
        console.log("--- ProxyReq Headers:", proxyReq.getHeaders());
      },
      proxyRes: (proxyRes, req, res) => {
        console.log("--- ProxyRes Status:", proxyRes.statusCode);
      },
    },
    logLevel: "debug",
  })
);

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Proxy server running on port " + listener.address().port);
});
