const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const EXPO_PROJECT_ID = "/bb172799-1f45-4bb5-8291-0bff2b358673";

const TARGET = "https://u.expo.dev";

app.use((req, res, next) => {
  console.log("Device Incoming Headers:", req.headers);
  next();
});

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
        const headersToForward = [
          "expo-runtime-version",
          "expo-platform",
          "expo-protocol-version",
          "expo-json-error",
          "expo-embedded-update-id",
          "expo-current-update-id",
          "expo-api-version",
          "eas-client-id",
          "expo-updates-environment",
          "accept",
        ];

        for (const h of headersToForward) {
          if (req.headers[h]) proxyReq.setHeader(h, req.headers[h]);
        }

        proxyReq.setHeader(
          "expo-channel-name",
          req.headers["expo-channel-name"] || "preview"
        );

        proxyReq.setHeader(
          "user-agent",
          req.headers["user-agent"] || "okhttp/4.9.2"
        );
        proxyReq.setHeader("host", "u.expo.dev");

        proxyReq.removeHeader("accept-encoding");
        proxyReq.removeHeader("connection");
        proxyReq.removeHeader("x-forwarded-for");
        proxyReq.removeHeader("x-forwarded-host");
        proxyReq.removeHeader("x-forwarded-proto");
        proxyReq.removeHeader("x-railway-request-id");
        proxyReq.removeHeader("x-railway-edge");
        proxyReq.removeHeader("x-real-ip");
        proxyReq.removeHeader("x-request-start");

        console.log("--- Final ProxyReq Headers:", proxyReq.getHeaders());
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
