import { GeoIPController } from "../../controller/GeoIP.controller";
import { WebScanController } from "../../controller/WebScan.controller";
import { WebScan } from "../../entity/WebScan.entity";
import { WebScanAlert } from "../../entity/WebScanAlert.entity";

const networkRequestScan = async (
  scan: WebScan,
  domains: string[],
  ips: string[],
  countries: string[]
) => {
  if (scan.alerts === null || scan.alerts === undefined) {
    scan.alerts = [];
  }

  //TODO: HF
  const skipGeolocating = scan.networkRequests.length > 250;
  for (const request of scan.networkRequests) {
    if (
      !["https://", "http://"].some((x) => request.requestUrl.startsWith(x))
    ) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = request.requestUrl;
      alert.description = `Tried to load resource with ${request.requestMethod} from non-HTTP(S) URL`;
      alert.method = "Request Analysis";
      alert.data = "";
      alert.webScanRequestId = request.id;
      alert.suspicionLevel = 3;
      scan.alerts.push(alert);

      request.failed = true;
      request.geoCity = "N/A";
      request.geoCountry = "XX";
      request.geoAs = "N/A";
      request.geoIp = "N/A";
      continue;
    }

    //TODO: HF
    if (skipGeolocating) {
      request.failed = false;
      request.geoCity = "N/A";
      request.geoCountry = "XX";
      request.geoAs = "N/A";
      request.geoIp = "N/A";
      continue;
    }

    const fqdn = await WebScanController.getFQDN(request.requestUrl);

    if (fqdn === null) {
      request.failed = true;
      request.geoCity = "N/A";
      request.geoCountry = "XX";
      request.geoAs = "N/A";
      request.geoIp = "N/A";
      continue;
    }

    if (!domains.includes(fqdn)) {
      domains.push(fqdn);
    }

    const ip = await WebScanController.resolveIP(fqdn);

    if (!ips.includes(ip)) {
      ips.push(ip);
    }

    request.geoIp = ip || "0.0.0.0";
    request.geoCountry =
      GeoIPController.getInstance().getGeoCountryISO(ip) || "XX";

    if (!countries.includes(request.geoCountry)) {
      countries.push(request.geoCountry);
    }

    request.geoCity = GeoIPController.getInstance().getGeoCity(ip) || "Unknown";
    request.geoAs = GeoIPController.getInstance().getASN(ip) || "Unknown";
  }

  return scan;
};

export default networkRequestScan;
