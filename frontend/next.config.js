/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self' https://www.google.com/recaptcha/;
  script-src 'self' 'sha256-NIRff6XlC0hjNr+KhDyrZAZrW1UbRjHu+wGSME6smvc=' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/releases/ https://www.googletagmanager.com${
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
  };
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
  img-src * data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  connect-src *;
  worker-src *;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "same-origin",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
