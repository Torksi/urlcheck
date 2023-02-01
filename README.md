# urlcheck

urlcheck is an open source alternative for urlscan.io. It browses the requested URL like any other normal user and takes screenshots of the page. It also gathers information such as network activity, contacted domains, contacted IPs, loaded resources, etc.

## Support / troubleshooting

### Setting up / updating geoip database

1. Download the latest database .mmdb files (ASN, City, Country) from [MaxMind](https://dev.maxmind.com/geoip/geoip2/geolite2/)
2. Unzip the archives and copy the .mmdb files to the `backend/geoip` directory (GeoLite2-ASN.mmdb, GeoLite2-City.mmdb, GeoLite2-Country.mmdb)

### error: error: function uuid_generate_v4() does not exist

This error is caused by the missing `uuid-ossp` extension. To fix it, run the following command:

```bash
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```
