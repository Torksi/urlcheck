import axios from "axios";
import { Router } from "express";
import prettify from "html-prettify";
import { js_beautify } from "js-beautify";
import { WebScanController } from "../controller/WebScan.controller";
import { WebScanAlert } from "../entity/WebScanAlert.entity";
import { WebScanNetRequest } from "../entity/WebScanNetRequest.entity";
import limiter from "../util/limiter";
import { Route } from "./Route";

export class WebScanRoute extends Route {
  constructor() {
    super(Router());
  }

  stringIsAValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  registerRoutes(): void {
    this.router.post("/", limiter, async (req, res) => {
      let { url } = req.body;
      const { token } = req.body;

      if (!url) {
        return res
          .status(400)
          .send({ success: false, message: "URL is required." });
      }

      if (!token) {
        return res
          .status(400)
          .send({ success: false, message: "Token is missing." });
      }

      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
      }

      if (!this.stringIsAValidUrl(url)) {
        return res.status(400).send({
          success: false,
          message:
            "The URL you provided is not valid. Please provide a valid URL.",
        });
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

      const scan: any = await WebScanController.scan(req, url);

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
      }

      return res.send({ success: true, id: scan.id });
    });

    this.router.get("/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      results.screenshot = "";
      results.createdBy = "";

      //TODO: HF
      if (Object.keys(results.globalVariables).length > 30) {
        results.globalVariables = {};
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/requests/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getRequestsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/links/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getLinksById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/redirects/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getRedirectsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/alerts/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getAlertsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/renders/:id", async (req, res) => {
      const { id } = req.params;

      const results: any = await WebScanController.getRendersById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      return res.send({ success: true, data: results });
    });

    this.router.get("/screenshot/:id", async (req, res) => {
      const { id } = req.params;

      const results = await WebScanController.getById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      //TODO: HF
      // eslint-disable-next-line no-constant-condition
      /*if (1 + 1 !== 5) {
        return res
          .status(501)
          .send({ success: false, message: "Not implemented" });
      }*/

      const image = Buffer.from(results.screenshot, "base64");

      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": image.length,
      });

      return res.end(image);
    });

    this.router.get("/:id/request/:reqid", async (req, res) => {
      const { id, reqid } = req.params;

      const results: any = await WebScanController.getRequestsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      const request: any = results.find(
        (r: WebScanNetRequest) => r.id === reqid
      );

      if (!request || !request.responseBody) {
        return res
          .status(404)
          .send({ success: false, message: "Request not found" });
      }

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": request.responseBody.length,
      });

      return res.end(request.responseBody);
    });

    this.router.get("/:id/alert/:reqid", async (req, res) => {
      const { id, reqid } = req.params;

      const results: any = await WebScanController.getAlertsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      const request: any = results.find((r: WebScanAlert) => r.id === reqid);

      if (!request || !request.data) {
        return res
          .status(404)
          .send({ success: false, message: "Request not found" });
      }

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": request.data.length,
      });

      return res.end(request.data);
    });

    this.router.get("/:id/request/:reqid/beautify", async (req, res) => {
      const { id, reqid } = req.params;

      const results = await WebScanController.getRequestsById(id);

      if (!results) {
        return res
          .status(404)
          .send({ success: false, message: "Scan not found" });
      }

      const request = results.find((r: WebScanNetRequest) => r.id === reqid);

      let beautified = "";

      if (!request || !request.responseBody) {
        return res
          .status(404)
          .send({ success: false, message: "Compatible request not found" });
      }

      if (
        [
          "application/javascript",
          "application/x-javascript",
          "text/javascript",
        ].some((r) => request.responseType.startsWith(r))
      ) {
        beautified = js_beautify(request.responseBody, {});
      } else if (
        ["text/html"].some((r) => request.responseType.startsWith(r))
      ) {
        beautified = prettify(request.responseBody);
      } else {
        return res
          .status(404)
          .send({ success: false, message: "Compatible request not found" });
      }

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": beautified.length,
      });

      return res.end(beautified);
    });
  }
}
