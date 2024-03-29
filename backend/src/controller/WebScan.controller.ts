/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from "express";
import { IncomingMessage } from "http";
import puppeteer from "puppeteer";
import dns from "dns";
import request_client from "request-promise-native";
import appDataSource from "../app-datasource";
import { WebScan } from "../entity/WebScan.entity";
import { WebScanNetRequest } from "../entity/WebScanNetRequest.entity";
import { GeoIPController } from "./GeoIP.controller";
import dynamicSort from "../util/dynamicSort";
import delay from "../util/delay";
import { WebScanRedirect } from "../entity/WebScanRedirect.entity";
import globalWindowDefaults from "../util/globalWindowDefaults";
import networkRequestScan from "../scan/web/networkRequestScan";
import redirectScan from "../scan/web/redirectScan";
import staticScriptScan from "../scan/web/staticScriptScan";
import { WebScanAlert } from "../entity/WebScanAlert.entity";
import { IScanError } from "../error/IScanError";
import { WebScanLink } from "../entity/WebScanLink.entity";
import { WebScanRender } from "../entity/WebScanRender.entity";
import whoisScan from "../scan/web/whoisScan";

export interface IExtendedIncomingMessage extends IncomingMessage {
  body: any;
}

export class WebScanController {
  /**
   * Get a WebScan by its id, if it exists, otherwise return null.
   * @param {string} id - webscan id
   * @returns A promise of a WebScan or null.
   */
  public static async getById(id: string): Promise<WebScan | null> {
    try {
      const result = await appDataSource
        .getRepository(WebScan)
        .find({ where: { id } });
      if (!result) return null;
      return result[0];
    } catch (_err) {
      return null;
    }
  }

  public static async getScreenshotById(id: string): Promise<WebScan | null> {
    try {
      const result = await appDataSource
        .getRepository(WebScan)
        .find({ where: { id }, select: ["id", "screenshot"] });
      if (!result) return null;
      return result[0];
    } catch (_err) {
      return null;
    }
  }

  /**
   * Get network requests associated with webscan
   * @param {string} id - webscan id
   * @returns An array of WebScanNetRequest objects.
   */
  public static async getRequestsById(
    id: string
  ): Promise<WebScanNetRequest[] | null> {
    try {
      const results = await appDataSource
        .getRepository(WebScanNetRequest)
        .find({ where: { webScanId: id } });
      if (!results) return null;
      return results.sort(dynamicSort("order")) || null;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Get alerts associated with webscan
   * @param {string} id - webscan id
   * @returns An array of WebScanAlert objects.
   */
  public static async getAlertsById(
    id: string
  ): Promise<WebScanAlert[] | null> {
    try {
      const results = await appDataSource
        .getRepository(WebScanAlert)
        .find({ where: { webScanId: id } });
      if (!results) return null;
      return results.sort(dynamicSort("order")) || null;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Get renders associated with webscan
   * @param {string} id - webscan id
   * @returns An array of WebScanRender objects.
   */
  public static async getRendersById(
    id: string
  ): Promise<WebScanRender[] | null> {
    try {
      const results = await appDataSource
        .getRepository(WebScanRender)
        .find({ where: { webScanId: id } });
      if (!results) return null;
      return results.sort(dynamicSort("order")) || null;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Get links associated with webscan
   * @param {string} id - webscan id
   * @returns An array of WebScanAlert objects.
   */
  public static async getLinksById(id: string): Promise<WebScanLink[] | null> {
    try {
      const results = await appDataSource
        .getRepository(WebScanLink)
        .find({ where: { webScanId: id } });
      if (!results) return null;
      return results.sort(dynamicSort("order")) || null;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Get redirects associated with webscan
   * @param {string} id - webscan id
   * @returns An array of WebScanRedirect objects.
   */
  public static async getRedirectsById(
    id: string
  ): Promise<WebScanRedirect[] | null> {
    try {
      const results = await appDataSource
        .getRepository(WebScanRedirect)
        .find({ where: { webScanId: id } });
      if (!results) return null;
      return results.sort(dynamicSort("order")) || null;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Resolves the FQDN of url, or null if the URL is invalid.
   * @param {string} url - The URL to get the FQDN from.
   * @returns The hostname of the URL.
   */
  public static async getFQDN(url: string): Promise<string | null> {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (err) {
      return null;
    }
  }

  /**
   * Resolve IP address of FQDN.
   * @param {string} fqdn - FQDN to resolve.
   * @returns A promise that resolves to a string.
   */
  public static async resolveIP(fqdn: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dns.lookup(fqdn, (err, address, _family) => {
        if (err) {
          resolve("0.0.0.0");
        }
        resolve(address);
      });
    });
  }

  public static async scan(
    req: Request,
    url: string
  ): Promise<WebScan | IScanError | null> {
    const includeResponseTypes = [
      "text/html",
      "application/json",
      "text/plain",
      //TODO: HF
      "application/javascript",
      "text/javascript",
      //"application/x-javascript",
      "text/csv",
      "text/xml",
    ];

    const fqdnBlacklist = ["192.168", "127.0", "172.16", "10.0"];

    const webScan = new WebScan();

    url = url.replace(/\.\.\//g, "/");
    url = url.replace("file://", "http://");

    webScan.url = url;
    webScan.createdBy = (
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "0.0.0.0"
    ).toString();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return { message: "URL is invalid", error: true } as IScanError;
    }

    const fqdn = await this.getFQDN(url);

    if (
      fqdn === null ||
      fqdn.toLowerCase() === "localhost" ||
      fqdnBlacklist.some((blacklisted) => fqdn.startsWith(blacklisted))
    ) {
      return { message: "Domain name is invalid", error: true } as IScanError;
    }

    webScan.ip = await this.resolveIP(fqdn);

    if (
      fqdnBlacklist.some((blacklisted) => webScan.ip.startsWith(blacklisted))
    ) {
      return { message: "Domain name is invalid", error: true } as IScanError;
    }

    webScan.createdFrom = (req.headers["cf-ipcountry"] || "XX").toString();

    webScan.urlCountry =
      GeoIPController.getInstance().getGeoCountryISO(webScan.ip) || "XX";
    webScan.urlCity =
      GeoIPController.getInstance().getGeoCity(webScan.ip) || "Unknown";
    webScan.urlAs =
      GeoIPController.getInstance().getASN(webScan.ip) || "Unknown";

    const browser = await puppeteer.launch({
      defaultViewport: { width: 1280, height: 720 },
      executablePath: (process.env.PUPPETEER_EXECUTABLE_PATH as string) || "",
      args: ["--disable-web-security", "--disable-features=site-per-process"],
      ignoreHTTPSErrors: true,
      headless: true,
    });
    const page = await browser.newPage();

    const result: any[] = [];
    const redirects: any[] = [];

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
    );

    await page.setRequestInterception(true);

    let requestOrder = 1;
    let redirectOrder = 1;

    /*const client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.on("Network.requestWillBeSent", (e) => {
      if (e.type !== "Document") {
        return;
      }
      redirects.push({ url: e.documentURL, order: redirectOrder });
      redirectOrder++;
    });*/

    page.on("response", (response) => {
      const status = response.status();
      if (status >= 300 && status <= 399) {
        redirects.push({
          urlFrom: response.url(),
          urlTo: response.headers()["location"],
          order: redirectOrder,
        });
        redirectOrder++;
      }
    });

    page.on("request", (request) => {
      request_client({
        uri: request.url(),
        resolveWithFullResponse: true,
      })
        .then((response: IExtendedIncomingMessage) => {
          const statusCode = response.statusCode;
          const requestUrl = request.url().replace("\u0000", "");

          const requestMethod = request.method().replace("\u0000", "");
          const responseHeaders = JSON.parse(
            JSON.stringify(response.headers).replace("\u0000", "")
          );
          const responseSize = responseHeaders["content-length"] || "";
          let responseBody = response.body;

          const contentType = responseHeaders["content-type"] || "text/plain";

          if (includeResponseTypes.some((ext) => contentType.startsWith(ext))) {
            responseBody = responseBody
              .replaceAll("\u0000", "")
              .replaceAll("\x00", "");
          } else {
            responseBody = null;
          }

          if (responseSize > 1000000) {
            responseBody = null;
          }

          // TODO: HF
          //responseBody = null;

          if (
            !requestUrl.startsWith("http://") &&
            !requestUrl.startsWith("https://")
          ) {
            throw new Error("Disallowed URL protocol");
          }

          result.push({
            statusCode,
            requestUrl,
            requestMethod,
            responseHeaders: {},
            responseSize,
            responseType: contentType,
            responseBody,
            order: requestOrder,
          });

          requestOrder++;
          request.continue();
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((error: any) => {
          result.push({
            order: requestOrder,
            statusCode: error.statusCode || 504,
            requestUrl: error.options.uri,
            responseHeaders:
              error.response && error.response.headers
                ? error.response.headers
                : {},
            responseSize: 0,
            responseType:
              (error.response && error.response.headers["content-type"]) ||
              "text/plain",
            failed: true,
          });

          requestOrder++;

          request.continue();
        });
    });

    try {
      await page.goto(url, {
        waitUntil: "networkidle0",
      });
    } catch (err) {
      const message = err.message;

      if (message.startsWith("net::ERR_NAME_NOT_RESOLVED")) {
        return {
          message: "Domain name could not be resolved",
          error: true,
        } as IScanError;
      } else if (message.startsWith("net::ERR_CONNECTION_REFUSED")) {
        return {
          message: "Connection to the website was refused",
          error: true,
        } as IScanError;
      } else if (message.startsWith("net::ERR_CONNECTION_TIMED_OUT")) {
        return {
          message: "Connection to the website was timed out",
          error: true,
        } as IScanError;
      } else if (message.startsWith("Navigation timeout of")) {
        return {
          message: "Connection to the website was timed out",
          error: true,
        } as IScanError;
      }

      console.error(err);
      console.log("--------------------");
      console.log("Error while scanning: " + url);
      console.log("Failed with unhandled error: " + message);
      return {
        message:
          "Something went wrong. Make sure the URL is valid and try again later.",
        error: true,
      } as IScanError;
    }

    await delay(5000);

    const finalUrl = page.url();

    if (finalUrl.startsWith("http://") || finalUrl.startsWith("https://")) {
      const screenshot = await page.screenshot({ quality: 75, type: "jpeg" });

      let globalVariables = {};

      await page.exposeFunction(
        "addGlobalVariables",
        function (variables: any) {
          globalVariables = variables;
        }
      );

      await page.exposeFunction("getGlobalWindowDefaults", function () {
        return globalWindowDefaults;
      });

      await page.evaluate(async () => {
        const vars: any = {};
        // @ts-ignore
        const defs = await getGlobalWindowDefaults();

        function refReplacer() {
          const m = new Map(),
            v = new Map();
          let init: any = null;

          return function (field: any, value: any) {
            const p =
              // @ts-ignore
              m.get(this) + (Array.isArray(this) ? `[${field}]` : "." + field);
            const isComplex = value === Object(value);

            if (isComplex) m.set(value, p);

            const pp = v.get(value) || "";
            const path = p.replace(/undefined\.\.?/, "");
            let val = pp ? `#REF:${pp[0] === "[" ? "$" : "$."}${pp}` : value;

            !init ? (init = value) : val === init ? (val = "#REF:$") : 0;
            if (!pp && isComplex) v.set(value, path);

            return val;
          };
        }

        for (const key in window) {
          // @ts-ignore
          if (!defs.includes(key)) {
            try {
              let val = JSON.stringify(window[key], refReplacer())
                .replaceAll("\u0000", "")
                .replaceAll("\x00", "");

              if (val.length > 150 && key !== "location") {
                val = val.substring(0, 150) + "...";
              }

              vars[key] = val;
            } catch (err) {
              //
            }
          }
        }

        // @ts-ignore
        addGlobalVariables(vars);
      });

      const fullDom = await page.evaluate(() => {
        const dc = document as any;
        if (dc !== null) {
          return dc.querySelector("*").outerHTML;
        }
        return null;
      });

      webScan.screenshot = screenshot.toString("base64");
      webScan.globalVariables = globalVariables;
      const fd = new WebScanRender();
      fd.body = fullDom;

      webScan.fullDom = [fd];
    } else {
      webScan.screenshot =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    }

    await browser.close();

    webScan.networkRequests = result;
    webScan.redirects = redirects;
    webScan.redirectCount = redirects.length;
    webScan.finalUrl = finalUrl;

    await appDataSource.manager.save(webScan);

    return await this.advancedScan(webScan);
  }

  public static async advancedScan(webScan: WebScan): Promise<WebScan> {
    const ips: string[] = [];
    const countries: string[] = [];
    const domains: string[] = [];

    await networkRequestScan(webScan, ips, countries, domains);
    await redirectScan(webScan, ips, countries, domains);
    await staticScriptScan(webScan);
    await whoisScan(webScan);

    webScan.ipsContacted = ips.length;
    webScan.countriesContacted = countries.length;
    webScan.domainsContacted = domains.length;
    webScan.requestsSent = webScan.networkRequests.length;

    return appDataSource.manager.save(webScan);
  }
}
