import type { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const apiProxy = createProxyMiddleware<Request, Response>({
  target: process.env.MEMBERSHIP_API_GATEWAY,
  changeOrigin: true,
  pathRewrite: {
    "^/api/membership": "", // strip "/api" from the URL
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      if (!process.env.MEMBERSHIP_API_KEY) {
        throw new Error("MEMBERSHIP_API_KEY is not set");
      }
      proxyReq.setHeader("X-Api-Key", process.env.MEMBERSHIP_API_KEY);
    },
    proxyRes: (proxyRes, req, res) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = req.headers.origin;
      proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
      for (const key in proxyRes.headers) {
        if (key.startsWith("x-amz")) {
          delete proxyRes.headers[key];
        }
      }
    },
  },
});

// Expose the proxy on the "/api/*" endpoint.
const handler = (req: Request, res: Response) => {
  return apiProxy(req, res);
};

export default handler;
