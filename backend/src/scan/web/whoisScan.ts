import whoiser from "whoiser";
import { WebScan } from "../../entity/WebScan.entity";

function getDomainName(url: string) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const matches = regex.exec(url);
  return matches ? matches[1] : null;
}

const whoisScan = async (scan: WebScan) => {
  const domainName = getDomainName(scan.url);
  if (domainName === null) {
    return;
  }

  const whois = await whoiser(domainName).catch(() => {
    return null;
  });

  if (whois) {
    scan.whois = JSON.stringify(whois);
  }
};

export default whoisScan;
