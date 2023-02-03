import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "") || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "") || 15 * 60,
  statusCode: 429,
  message: {
    success: false,
    message:
      "You have exceeded the maximum number of requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiter;
