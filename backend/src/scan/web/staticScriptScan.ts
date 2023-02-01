import { WebScan } from "../../entity/WebScan.entity";
import { WebScanAlert } from "../../entity/WebScanAlert.entity";

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

    analyzeFunctions(cleanedBody, request.requestUrl, scan, request.id);

    const alerts = scan.alerts.filter((a) => a.webScanRequestId === request.id);
    if (alerts.length > 0) {
      alerts[alerts.length - 1].fullyDeobfuscated = true;
    }
  }

  return scan;
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

  if (scan.alerts === null || scan.alerts === undefined) {
    scan.alerts = [];
  }

  const evalMatches = body.match(evalRegex);
  if (evalMatches !== null) {
    for (const match of evalMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description =
        "eval() - found, it might be used to execute malicious code";
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 3;
      scan.alerts.push(alert);
    }
  }

  const windowLocationMatches = body.match(windowLocationRegex);
  if (windowLocationMatches !== null) {
    for (const match of windowLocationMatches) {
      const alert = new WebScanAlert();
      alert.webScan = scan;
      alert.url = url;
      alert.description =
        "window.location - found, it might be used to redirect the user";
      alert.method = "Static Script Analysis";
      alert.data = match;
      alert.webScanRequestId = requestId;
      alert.suspicionLevel = 2;
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

export default staticScriptScan;
