const Info = () => {
  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <h2 className="subtitle">About</h2>
          <p>
            <strong>urlcheck</strong> is a tool designed to investigate
            potentially harmful links and websites. It operates by simulating
            the browsing behavior of a typical user, scanning the given URL for
            any suspicious activities or signs of malicious content. Once the
            scan is complete, a comprehensive report is generated that includes
            a detailed list of network requests, a screenshot of the webpage,
            and other relevant information.
          </p>
        </div>
        <div className="col-md-6">
          <h2 className="subtitle">Privacy</h2>
          <p>
            Our top priority is to safeguard your privacy when you use our
            service. We automatically delete all scans and associated data after
            48 hours. This ensures that your information is kept safe and
            secure, and that we do not retain it any longer than necessary. If
            you have any more questions, please{" "}
            <a
              className="text-info"
              href="https://ruhis.fi/"
              target="_blank"
              rel="noreferrer"
            >
              contact us
            </a>
            .
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h2 className="subtitle">Changelog</h2>
          <p>
            <strong>26/05/2023:</strong>
          </p>
          <ul>
            <li>Added Whois-results</li>
          </ul>
          <p>
            <strong>13/04/2023:</strong>
          </p>
          <ul>
            <li>Added global variable logging</li>
            <li>Optimized API requests</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Info;
