import "reflect-metadata";
import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import TrimMiddleware from "./middleware/TrimMiddleware";
import { WebScanRoute } from "./routes/WebScan.route";
import { EmailScanRoute } from "./routes/EmailScan.route";

const app = express();

if (process.env.NODE_ENV === "production") app.set("trust proxy", true);
app.use(express.json());

app.use(helmet({ crossOriginResourcePolicy: false }));

morgan.token("cf-connecting-ip", (req: any) => {
  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress
  );
});

morgan.token("cf-country", (req: any) => {
  return req.headers["cf-ipcountry"] || "XX";
});

morgan.token("cf-ray", (req: any) => {
  return req.headers["cf-ray"] || "XXXXX";
});

/* Logging */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else if (process.env.NODE_ENV === "production") {
  app.use(
    morgan(
      "[:date[iso]] :cf-connecting-ip :cf-country :cf-ray - :method :url :status :response-time ms - :res[content-length]"
    )
  );
}

app.use(TrimMiddleware);

app.use(cors({ origin: true, credentials: true }));

app.use(compression());

// Prevent error messages from being sent to the client and exposing stack trace
app.use((err: any, _: Request, res: Response, next: NextFunction) => {
  if (err.status === 400 && "body" in err) {
    return res.status(400).send({ message: err.message });
  }

  next();
});

app.use("/api/web", new WebScanRoute().getRouter());
app.use("/api/email", new EmailScanRoute().getRouter());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (_, res, _next) {
  return res.status(404).json({ status: 404, message: "Route not found" });
});

export default app;
