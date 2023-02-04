/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import moment from "moment";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import ErrorScreen from "../../../components/ErrorScreen";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import AlertsTable from "../../../components/results/AlertsTable";
import GlobalVariablesTable from "../../../components/results/GlobalVariablesTable";
import LinksTable from "../../../components/results/LinksTable";
import RedirectsTable from "../../../components/results/RedirectsTable";
import RequestsTable from "../../../components/results/RequestsTable";
import Title from "../../../components/Title";
import getCountry from "../../../util/countryName";
import dynamicSort from "../../../util/dynamicSort";
import getFlagEmoji from "../../../util/flagEmoji";

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [rootData, setRootData] = useState<any>(null);
  const [requestsData, setRequestsData] = useState<any>(null);
  const [redirectData, setRedirectData] = useState<any>(null);
  const [alertData, setAlertData] = useState<any>(null);
  const [linkData, setLinkData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/web/${id}`)
        .then((res) => setRootData(res.data.data))
        .catch((err) => {
          return (
            <div className="main">
              <div className="row mt-5">
                <div className="col-md-12">
                  <h1 className="title">
                    <Link href="/">
                      <span className="text-info">urlcheck</span> search engine
                    </Link>
                  </h1>
                </div>
              </div>
              <div className="row text-center mt-4">
                <Title pageName="Failed to load results" />
                <ErrorScreen description="Couldn't load the scan results. They might still be in progress or removed." />
              </div>
            </div>
          );
        });

      axios
        .get(`/api/web/requests/${id}`)
        .then((res) => setRequestsData(res.data.data))
        .catch((err) => {
          return null;
        });

      axios
        .get(`/api/web/redirects/${id}`)
        .then((res) => setRedirectData(res.data.data))
        .catch((err) => {
          return null;
        });

      axios
        .get(`/api/web/alerts/${id}`)
        .then((res) => setAlertData(res.data.data))
        .catch((err) => {
          return null;
        });

      axios
        .get(`/api/web/links/${id}`)
        .then((res) => setLinkData(res.data.data))
        .catch((err) => {
          return null;
        });
    }
  }, [setRootData, setRequestsData, id]);

  const countriesList: any = [];
  const ipList: any = [];
  const domainList: any = [];

  if (requestsData) {
    // loop thru requests and add countries to array, also keep track of how many times each country appears
    requestsData.forEach((request: any) => {
      if (request.geoCountry) {
        const countryIndex = countriesList.findIndex(
          (country: any) => country.country === request.geoCountry
        );

        if (countryIndex === -1) {
          countriesList.push({ country: request.geoCountry, count: 1 });
        } else {
          countriesList[countryIndex].count++;
        }
      }

      if (request.geoIp) {
        const ipIndex = ipList.findIndex((ip: any) => ip.ip === request.geoIp);

        if (ipIndex === -1) {
          ipList.push({
            ip: request.geoIp,
            count: 1,
            as: request.geoAs,
            country: request.geoCountry,
          });
        } else {
          ipList[ipIndex].count++;
        }
      }

      let domain = request.requestUrl;

      try {
        const urlObj = new URL(domain);
        domain = urlObj.hostname;
      } catch (err) {
        //
      }

      if (domain) {
        const domainIndex = domainList.findIndex(
          (domainObj: any) => domainObj.domain === domain
        );

        if (domainIndex === -1) {
          domainList.push({
            domain,
            ip: request.geoIp,
            count: 1,
            as: request.geoAs,
            country: request.geoCountry,
          });
        } else {
          domainList[domainIndex].count++;
        }
      }
    });
  }

  if (!rootData) {
    return (
      <div className="main">
        <div className="row mt-5">
          <div className="col-md-12">
            <h1 className="title">
              <Link href="/">
                <span className="text-info">urlcheck</span> search engine
              </Link>
            </h1>
          </div>
        </div>
        <div className="row mt-4">
          <Title pageName="Loading..." />
          <div className="text-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <Title
        pageName={rootData.url
          .replaceAll("https://", "")
          .replaceAll("http://", "")}
      />
      {rootData && (
        <Head>
          <meta
            property="og:title"
            content={`${rootData.url
              .replaceAll("https://", "")
              .replaceAll("http://", "")} | urlcheck`}
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content={`${process.env.NEXT_PUBLIC_API}/api/web/screenshot/${id}`}
          />
        </Head>
      )}
      <div className="row mt-5">
        <div className="col-md-12">
          <h1 className="title">
            <Link href="/">
              <span className="text-info">urlcheck</span> search engine
            </Link>
          </h1>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-6">
          <h4 style={{ lineBreak: "anywhere" }}>
            {rootData.url.replaceAll("https://", "").replaceAll("http://", "")}
          </h4>
          <p>
            <strong>IP:</strong> {rootData.ip}{" "}
            {getFlagEmoji(rootData.urlCountry)} | (AS{rootData.urlAs})
          </p>
          <p style={{ lineBreak: "anywhere" }}>
            <strong>URL:</strong> {rootData.url}
          </p>
          <p>
            <strong>Scanned:</strong>{" "}
            {moment(rootData.createdAt).utc().format("MMMM Do YYYY, HH:mm:ss")}{" "}
            UTC from {rootData.createdFrom} {getFlagEmoji(rootData.createdFrom)}
          </p>
          <hr />
          <p>
            The website sent{" "}
            <strong className="text-info">{rootData.requestsSent}</strong>{" "}
            different network requests to{" "}
            <strong className="text-info">{rootData.ipsContacted}</strong> IPs
            and{" "}
            <strong className="text-info">{rootData.domainsContacted}</strong>{" "}
            domains in{" "}
            <strong className="text-info">{rootData.countriesContacted}</strong>{" "}
            different countries. The website redirected the browser{" "}
            <strong className="text-info">{rootData.redirectCount}</strong>{" "}
            times.
          </p>
        </div>
        <div className="col-md-6">
          <h4>Screenshot</h4>
          <a
            href={`${process.env.NEXT_PUBLIC_API}/api/web/screenshot/${id}`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API}/api/web/screenshot/${id}`}
              alt={`Screenshot of ${rootData.url}`}
              className="img-fluid"
            />
          </a>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-12">
          <Tabs
            defaultActiveKey="summary"
            transition={false}
            id="result-tabs"
            className="mb-3"
          >
            <Tab eventKey="summary" title="Connection Summary">
              <div className="row mt-4">
                <div className="col-md-8">
                  <h4>IPs{requestsData ? ` (${ipList.length})` : ""}</h4>
                  {!requestsData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {requestsData && (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">IP</th>
                            <th scope="col">Count</th>
                            <th scope="col">Country</th>
                            <th scope="col">AS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ipList
                            .sort(dynamicSort("count"))
                            .reverse()
                            .map((ctr: any, index: number) => (
                              <tr key={index}>
                                <td>{ctr.ip}</td>
                                <td>{ctr.count}</td>
                                <td>
                                  {getFlagEmoji(ctr.country)}{" "}
                                  {getCountry(ctr.country) || "Unknown"}
                                </td>
                                <td>{ctr.as}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <h4>
                    Countries{requestsData ? ` (${countriesList.length})` : ""}
                  </h4>
                  {!requestsData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {requestsData && (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">Country</th>
                            <th scope="col">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {countriesList
                            .sort(dynamicSort("count"))
                            .reverse()
                            .map((ctr: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  {getFlagEmoji(ctr.country)}{" "}
                                  {getCountry(ctr.country) || "Unknown"}
                                </td>
                                <td>{ctr.count}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
                  <h4>
                    Domains{requestsData ? ` (${domainList.length})` : ""}
                  </h4>
                  {!requestsData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {requestsData && (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">Domain</th>
                            <th scope="col">Count</th>
                            <th scope="col">IP</th>
                            <th scope="col">Country</th>
                            <th scope="col">AS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {domainList
                            .sort(dynamicSort("count"))
                            .reverse()
                            .map((ctr: any, index: number) => (
                              <tr key={index}>
                                <td>{ctr.domain}</td>
                                <td>{ctr.count}</td>
                                <td>{ctr.ip}</td>
                                <td>
                                  {getFlagEmoji(ctr.country)}{" "}
                                  {getCountry(ctr.country) || "Unknown"}
                                </td>
                                <td>{ctr.as}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="alerts"
              title={
                <span>
                  <span className="badge text-bg-info text-white rounded-pill badge-sm me-2">
                    {alertData ? alertData.length : 0}
                  </span>
                  Alerts
                </span>
              }
            >
              <div className="row">
                <div className="col-md-12">
                  <h4>Alerts{alertData ? ` (${alertData.length})` : ""}</h4>
                  {!alertData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {alertData && <AlertsTable id={id} alertData={alertData} />}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="requests"
              title={
                <span>
                  <span className="badge text-bg-info text-white rounded-pill badge-sm me-2">
                    {requestsData ? requestsData.length : 0}
                  </span>
                  Requests
                </span>
              }
            >
              <div className="row">
                <div className="col-md-12">
                  <h4>
                    Network Requests
                    {requestsData ? ` (${requestsData.length})` : ""}
                  </h4>
                  {!requestsData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {requestsData && (
                    <RequestsTable id={id} requestData={requestsData} />
                  )}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="redirects"
              title={
                <span>
                  <span className="badge text-bg-info text-white rounded-pill badge-sm me-2">
                    {redirectData ? redirectData.length : 0}
                  </span>
                  Redirects
                </span>
              }
            >
              <div className="row">
                <div className="col-md-12">
                  <h4>
                    Redirects{redirectData ? ` (${redirectData.length})` : ""}
                  </h4>

                  {!redirectData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}

                  {redirectData && (
                    <RedirectsTable id={id} redirectData={redirectData} />
                  )}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="links"
              title={
                <span>
                  <span className="badge text-bg-info text-white rounded-pill badge-sm me-2">
                    {linkData ? linkData.length : 0}
                  </span>
                  Links
                </span>
              }
            >
              <div className="row">
                <div className="col-md-12">
                  <h4>Links{linkData ? ` (${linkData.length})` : ""}</h4>
                  {!alertData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {linkData && <LinksTable id={id} linkData={linkData} />}
                </div>
              </div>
            </Tab>
            <Tab eventKey="variables" title={<span>Global Variables</span>}>
              <div className="row">
                <div className="col-md-12">
                  <h4>Global Variables</h4>
                  <p>
                    Here are some JavaScript variables that might contain
                    interesting data.
                  </p>
                  {!rootData && (
                    <div className="text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {rootData && <GlobalVariablesTable scanData={rootData} />}
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
