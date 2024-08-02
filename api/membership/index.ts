import type { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const apiProxy = createProxyMiddleware<Request, Response>({
  target: process.env.MEMBERSHIP_API_GATEWAY,
  changeOrigin: true,
  pathRewrite: {
    "^/membership": "",
  },
  headers: {
    "X-Api-Key": process.env.MEMBERSHIP_API_KEY,
  },
  on: {
    proxyRes: (proxyRes, req, res) => {
      for (const key in proxyRes.headers) {
        if (key.toLowerCase().startsWith("x-amz")) {
          delete proxyRes.headers[key];
        }
      }
      proxyRes.headers["Access-Control-Allow-Origin"] = req.headers.origin;
      proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
    },
  },
});

const handler = (req: Request, res: Response) => {
  return apiProxy(req, res);
};

export default handler;
