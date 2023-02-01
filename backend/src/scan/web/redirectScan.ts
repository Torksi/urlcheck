import { GeoIPController } from "../../controller/GeoIP.controller";
import { WebScanController } from "../../controller/WebScan.controller";
import { WebScan } from "../../entity/WebScan.entity";

const redirectScan = async (
  scan: WebScan,
  domains: string[],
  ips: string[],
  countries: string[]
) => {
  for (const redirect of scan.redirects) {
    const fqdn = await WebScanController.getFQDN(redirect.urlTo);

    if (fqdn === null) {
      redirect.failed = true;
      redirect.geoCity = "N/A";
      redirect.geoCountry = "XX";
      redirect.geoAs = "N/A";
      redirect.geoIp = "N/A";
      continue;
    }

    if (!domains.includes(fqdn)) {
      domains.push(fqdn);
    }

    const ip = await WebScanController.resolveIP(fqdn);

    if (!ips.includes(ip)) {
      ips.push(ip);
    }

    redirect.geoIp = ip;
    redirect.geoCountry =
      GeoIPController.getInstance().getGeoCountryISO(ip) || "XX";

    if (!countries.includes(redirect.geoCountry)) {
      countries.push(redirect.geoCountry);
    }

    redirect.geoCity =
      GeoIPController.getInstance().getGeoCity(ip) || "Unknown";
    redirect.geoAs = GeoIPController.getInstance().getASN(ip) || "Unknown";
  }

  return scan;
};

export default redirectScan;
