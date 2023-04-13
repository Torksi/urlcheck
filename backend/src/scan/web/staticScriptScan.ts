import { WebScan } from "../../entity/WebScan.entity";
import { WebScanAlert } from "../../entity/WebScanAlert.entity";
import { WebScanLink } from "../../entity/WebScanLink.entity";
import { WebScanNetRequest } from "../../entity/WebScanNetRequest.entity";
import checksums from "../../util/fileChecksums";
import { md5 } from "../../util/hash";

interface IScanResult {
  score: number;
  body: string;
}

const staticScriptScan = async (scan: WebScan) => {
  for (const request of scan.networkRequests) {
    const body = request.responseBody;
    if (body === null || body.length === 0) {
      continue;
    }

    let deobfRound = 1;
    let cleanedBody = body;
    let deobf = deobfuscate(
      cleanedBody,
      deobfRound,
      request.requestUrl,
      scan,
      request.id
    );
    cleanedBody = deobf.body;

    while (deobf.score > 0) {
      deobfRound += 1;
      deobf = deobfuscate(
        cleanedBody,
        deobfRound,
        request.requestUrl,
        scan,
        request.id
      );
      cleanedBody = deobf.body;
    }

    const alerts = (scan.alerts || []).filter(
      (a) => a.webScanRequestId === request.id
    );
    if (alerts.length > 0) {
      alerts[alerts.length - 1].fullyDeobfuscated = true;
    }

    if (request.responseType.startsWith("text/html")) {
      findEmails(cleanedBody, request.requestUrl, scan, request.id);
      analyzeFunctions(cleanedBody, request.requestUrl, scan, request.id);
      findLinks(cleanedBody, request.requestUrl, scan, request.id);
    }
    await verifyIntegrity(cleanedBody, request.requestUrl, scan, request);
  }

  return scan;
};

const verifyIntegrity = async (
  body: string,
  url: string,
  scan: WebScan,
  request: WebScanNetRequest
) => {
  if (request.id && scan.id) {
    const hash = md5(body);
    console.log(url, hash);
  }

  const fileName = request.requestUrl.split("/");

  if (
    checksums[fileName[fileName.length - 1]] &&
    checksums[fileName[fileName.length - 1]] === md5(body)
  ) {
    request.integrity = true;
  }

  scan.networkRequests = scan.networkRequests.map((r) =>
    r.id === request.id ? request : r
  );
};

const findEmails = (
  body: string,
  url: string,
  scan: WebScan,
  requestId: string
) => {
  const emailRegex =
    // eslint-disable-next-line no-useless-escape, no-control-regex
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;

  if (scan.alerts === null || scan.alerts === undefined) {
    scan.alerts = [];
  }

  const emailMatches = body.match(emailRegex);
  if (emailMatches !== null && requestId !== null) {
    for (const match of emailMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description = `Email address detected '${match}'`;
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel =
        match.endsWith("@example.com") ||
        match.endsWith("@example.onmicrosoft.com")
          ? 0
          : 2;
      scan.alerts.push(alert);
    }
  }
};

const findLinks = (
  body: string,
  url: string,
  scan: WebScan,
  requestId: string
) => {
  const aLinkRegex = /(?<=<a\s+href=["'])([^"']+)(?=["'])/gi;
  const aLinkRegexMatches = body.match(aLinkRegex);

  if (scan.links === null || scan.links === undefined) {
    scan.links = [];
  }

  if (aLinkRegexMatches !== null && requestId !== null) {
    for (const match of aLinkRegexMatches) {
      const link = new WebScanLink();
      link.webScan = scan;
      link.url = url;
      link.target = match;
      link.type = "<a> href";
      link.requestId = requestId;
      scan.links.push(link);
    }
  }
};

const analyzeFunctions = (
  body: string,
  url: string,
  scan: WebScan,
  requestId: string
) => {
  const evalRegex = /eval\s*\(\s*(['"].*?['"]|[^)]*?)\s*\)/gi;
  const windowLocationRegex =
    /window\.location.replace\s*.\s*(['"].*?['"]|[^;]*)/gi;
  const debuggerRegex = /debugger/gi;

  if (scan.alerts === null || scan.alerts === undefined) {
    scan.alerts = [];
  }

  const evalMatches = body.match(evalRegex);
  if (evalMatches !== null && requestId !== null) {
    for (const match of evalMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description =
        "eval() - found, it might be used to execute malicious code";
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 1;
      scan.alerts.push(alert);
    }
  }

  const windowLocationMatches = body.match(windowLocationRegex);
  if (windowLocationMatches !== null && requestId !== null) {
    for (const match of windowLocationMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description =
        "window.location.replace - found, it might be used to redirect the user";
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 3;
      scan.alerts.push(alert);
    }
  }

  const debuggerRegexMatches = body.match(debuggerRegex);
  if (debuggerRegexMatches !== null && requestId !== null) {
    for (const match of debuggerRegexMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description =
        "debugger - found, it might be used to prevent reverse engineering";
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 3;
      scan.alerts.push(alert);
    }
  }
};

const deobfuscate = (
  body: string,
  round: number,
  url: string,
  scan: WebScan,
  requestId: string
): IScanResult => {
  let score = 0;

  const atobd = atobDeobfuscate(body, round, url, scan, requestId);
  score += atobd.score;
  body = atobd.body;

  const urld1 = urlDeobfuscate1(body, round, url, scan, requestId);
  score += urld1.score;
  body = urld1.body;

  const urld2 = urlDeobfuscate2(body, round, url, scan, requestId);
  score += urld2.score;
  body = urld2.body;

  const urld3 = urlDeobfuscate3(body, round, url, scan, requestId);
  score += urld3.score;
  body = urld3.body;

  body = body.trim();
  return { score, body };
};

const atobDeobfuscate = (
  body: string,
  round: number,
  url: string,
  scan: WebScan,
  requestId: string
): IScanResult => {
  let score = 0;
  const atobRegex = /atob\s*\(\s*["'](.*?)["']\s*\)/gi;
  //const atobRegex = /atob\s*\(\s*"(.*)"\s*\)/;

  const atobMatch = body.match(atobRegex);
  if (atobMatch === null || atobMatch.length === 0) {
    return { score: 0, body };
  }

  for (const match of atobMatch) {
    if (!match.trim().toLowerCase().startsWith("atob")) {
      continue;
    }

    let cleanedMatch = match.replace(atobRegex, "$1");
    try {
      cleanedMatch = Buffer.from(cleanedMatch, "base64").toString("utf8");
      score += 1;

      body = body.replace(match, cleanedMatch);

      const alert = new WebScanAlert();
      alert.url = url;
      alert.method = "Script Deobfuscation";
      alert.description = `unescape() - hex encoded string found and decoded on round ${round}`;
      alert.data = body;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 2;

      if (scan.alerts === null || scan.alerts === undefined) {
        scan.alerts = [];
      }

      scan.alerts.push(alert);
    } catch (err) {
      console.error(err);
    }
  }
  return { score, body };
};

const urlDeobfuscate1 = (
  body: string,
  round: number,
  url: string,
  scan: WebScan,
  requestId: string
): IScanResult => {
  let score = 0;
  const unescapeRegex = /unescape\s*\(\s*["'](.*?)["']\s*\)/gi;

  const urlMatch = body.match(unescapeRegex);
  if (urlMatch === null || urlMatch.length === 0) {
    return { score: 0, body };
  }

  for (const match of urlMatch) {
    let cleanedMatch = match.replace(unescapeRegex, "$1");
    try {
      cleanedMatch = unescape(cleanedMatch);

      score += 1;

      body = body.replace(match, cleanedMatch);

      const alert = new WebScanAlert();
      alert.url = url;
      alert.method = "Script Deobfuscation";
      alert.description = `unescape() - hex encoded string found and decoded on round ${round}`;
      alert.data = body;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 2;

      if (scan.alerts === null || scan.alerts === undefined) {
        scan.alerts = [];
      }

      scan.alerts.push(alert);
    } catch (err) {
      console.error(err);
    }
  }
  return { score, body };
};

const urlDeobfuscate2 = (
  body: string,
  round: number,
  url: string,
  scan: WebScan,
  requestId: string
): IScanResult => {
  let score = 0;
  const unescapeRegex = /decodeURI\s*\(\s*["'](.*?)["']\s*\)/gi;

  const urlMatch = body.match(unescapeRegex);
  if (urlMatch === null || urlMatch.length === 0) {
    return { score: 0, body };
  }

  for (const match of urlMatch) {
    let cleanedMatch = match.replace(unescapeRegex, "$1");
    try {
      cleanedMatch = decodeURI(cleanedMatch);

      score += 1;

      body = body.replace(match, cleanedMatch);

      const alert = new WebScanAlert();
      alert.url = url;
      alert.method = "Script Deobfuscation";
      alert.description = `decodeURI() - hex encoded string found and decoded on round ${round}`;
      alert.data = body;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 2;

      if (scan.alerts === null || scan.alerts === undefined) {
        scan.alerts = [];
      }

      scan.alerts.push(alert);
    } catch (err) {
      console.error(err);
    }
  }
  return { score, body };
};

const urlDeobfuscate3 = (
  body: string,
  round: number,
  url: string,
  scan: WebScan,
  requestId: string
): IScanResult => {
  let score = 0;
  const unescapeRegex = /decodeURIComponent\s*\(\s*["'](.*?)["']\s*\)/gi;

  const urlMatch = body.match(unescapeRegex);
  if (urlMatch === null || urlMatch.length === 0) {
    return { score: 0, body };
  }

  for (const match of urlMatch) {
    let cleanedMatch = match.replace(unescapeRegex, "$1");
    try {
      cleanedMatch = decodeURIComponent(cleanedMatch);

      score += 1;

      body = body.replace(match, cleanedMatch);

      const alert = new WebScanAlert();
      alert.url = url;
      alert.method = "Script Deobfuscation";
      alert.description = `decodeURIComponent() - hex encoded string found and decoded on round ${round}`;
      alert.data = body;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 2;

      if (scan.alerts === null || scan.alerts === undefined) {
        scan.alerts = [];
      }

      scan.alerts.push(alert);
    } catch (err) {
      console.error(err);
    }
  }
  return { score, body };
};

export default staticScriptScan;
