import axios from "axios";
import { Router } from "express";
import multer from "multer";
import { EmailScanController } from "../controller/EmailScan.controller";
import limiter from "../util/limiter";
import { Route } from "./Route";

export class EmailScanRoute extends Route {
  constructor() {
    super(Router());
  }

  registerRoutes(): void {
    this.router.post(
      "/",
      multer().single("email"),
      limiter,
      async (req, res) => {
        const { token } = req.body;

        if (process.env.NODE_ENV !== "development") {
          return res
            .status(501)
            .send({ success: false, message: "Not implemented." });
        }

        if (!req.file) {
          return res
            .status(400)
            .send({ success: false, message: "Source is required." });
        }

        const source = req.file.buffer.toString("utf8");

        console.log("source", source);

        if (!token) {
          return res
            .status(400)
            .send({ success: false, message: "Token is missing." });
        }

        const captchaRes = await axios
          .post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
          )
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .catch((_err) => {
            return res.status(500).send({
              success: false,
              message: "reCAPTCHA failed. Please try again.",
            });
          });

        if (captchaRes.status !== 200) {
          return res.status(429).send({
            success: false,
            message: "reCAPTCHA failed. Are you a human?",
          });
        }

        const mail = await EmailScanController.parseEmail(source);

        return res.send({ success: true, mail });

        /*const scan: any = await WebScanController.scan(req, url);

      if (!scan || Object.keys(scan).includes("error")) {
        if (Object.keys(scan).includes("error")) {
          return res.status(500).send({
            success: false,
            message: scan.message,
          });
        }
        return res.status(500).send({
          success: false,
          message:
            "Something went wrong. Make sure the URL is valid and try again.",
        });
      }*/

        //return res.send({ success: true, id: "CHANGE_ME_RIGHT_NOW" });
      }
    );
  }
}
