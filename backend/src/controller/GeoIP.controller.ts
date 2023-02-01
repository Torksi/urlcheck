import fs from "fs";
import path from "path";
import * as mmdb from "mmdb-lib";
import { AsnResponse, CityResponse } from "mmdb-lib/lib/reader/response";

export class GeoIPController {
  static Instance: GeoIPController;
  cityDb: Buffer;
  asnDb: Buffer;

  constructor() {
    GeoIPController.Instance = this;
    this.cityDb = fs.readFileSync(
      path.resolve(__dirname, "../../geoip/GeoLite2-City.mmdb")
    );
    this.asnDb = fs.readFileSync(
      path.resolve(__dirname, "../../geoip/GeoLite2-ASN.mmdb")
    );
  }

  public getGeoCity(ip: string): string | null {
    const reader = new mmdb.Reader<CityResponse>(this.cityDb);
    const result = reader.get(ip);

    if (result && result.city) {
      return result.city.names.en;
    }

    return null;
  }

  public getGeoCountry(ip: string): string | null {
    const reader = new mmdb.Reader<CityResponse>(this.cityDb);
    const result = reader.get(ip);

    if (result && result.country) {
      return result.country.names.en;
    }

    return null;
  }

  public getGeoCountryISO(ip: string): string | null {
    const reader = new mmdb.Reader<CityResponse>(this.cityDb);
    const result = reader.get(ip);

    if (result && result.country) {
      return result.country.iso_code;
    }

    return null;
  }

  public getASN(ip: string): string | null {
    const reader = new mmdb.Reader<AsnResponse>(this.asnDb);
    const result = reader.get(ip);

    if (result) {
      return `${result.autonomous_system_number} - ${result.autonomous_system_organization}`;
    }

    return null;
  }

  public static getInstance(): GeoIPController {
    if (!this.Instance) {
      this.Instance = new GeoIPController();
    }

    return this.Instance;
  }
}
