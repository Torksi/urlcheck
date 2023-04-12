/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useReCaptcha } from "next-recaptcha-v3";
import Title from "../components/Title";
import axios from "axios";
import LoadingScan from "../components/LoadingScan";
import ErrorScreen from "../components/ErrorScreen";
import Link from "next/link";
import { Tab, Tabs } from "react-bootstrap";

export default function IndexPage() {
  const router = useRouter();
  const searchInputRef = useRef<any>(null);
  const [webSearchText, setWebSearchText] = useState("");

  const [emailSearchText, setEmailSearchText] = useState("");
  const [emailFile, setEmailFile] = useState<File>();

  const handleEmailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEmailFile(e.target.files[0]);
    }
  };

  const [scanStatus, setScanStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const { executeRecaptcha } = useReCaptcha();

  const handleWebSearch = async (event: FormEvent) => {
    event.preventDefault();

    const search = webSearchText.trim();
    setErrorMessage("");
    setScanStatus(1);

    const token = await executeRecaptcha("startScan");

    axios
      .post("/api/web", { url: search, token })
      .then((res) => {
        setWebSearchText("");
        router.push(`/web/results/${res.data.id}`);
      })
      .catch((err) => {
        setScanStatus(0);
        if (err.response && err.response.data) {
          setErrorMessage(err.response.data.message);
        } else {
          console.error(err);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      });
  };

  const handleEmailSearch = async (event: FormEvent) => {
    event.preventDefault();

    const search = emailSearchText.trim();
    setErrorMessage("");
    setScanStatus(1);

    const token = await executeRecaptcha("startScan");

    if (emailFile === undefined) {
      setErrorMessage(
        "Email text upload is still work in progess. Please select a file to upload."
      );
      setScanStatus(0);
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("email", emailFile, emailFile.name);

    axios
      .post("/api/email", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setEmailFile(undefined);
        setEmailSearchText("");
        router.push(`/email/results/${res.data.id}`);
      })
      .catch((err) => {
        setScanStatus(0);
        if (err.response && err.response.data) {
          setErrorMessage(err.response.data.message);
        } else {
          console.error(err);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      });
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <>
      <Title pageName="Home" />
      <main className="main">
        <div className="row mt-5">
          <div className="col-md-12">
            <h1 className="title">
              <Link href="/">
                <span className="text-info">urlcheck</span> search engine
              </Link>
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <p className="description intro-text">
              Safe way to investigate suspicious content.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Tabs
              defaultActiveKey="web"
              transition={false}
              id="tool-tabs"
              className="mb-3"
              fill
            >
              <Tab eventKey="web" title="Web / URL" disabled={scanStatus === 1}>
                <div className="row">
                  <div className="col-md-12">
                    {errorMessage.length > 0 && (
                      <ErrorScreen description={errorMessage} />
                    )}
                    {scanStatus === 0 && (
                      <form onSubmit={handleWebSearch}>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter URL to scan"
                            value={webSearchText}
                            onChange={(e) => setWebSearchText(e.target.value)}
                            aria-label="Enter URL to scan"
                            aria-describedby="submitButton"
                            ref={searchInputRef}
                          />
                          <button
                            className="btn btn-primary"
                            type="submit"
                            id="submitButton"
                          >
                            Scan
                          </button>
                        </div>
                      </form>
                    )}
                    {scanStatus === 1 && <LoadingScan />}
                  </div>
                </div>
              </Tab>
              <Tab eventKey="email" title="Email" disabled={scanStatus === 1}>
                <div className="row">
                  {process.env.NODE_ENV !== "development" ? (
                    <div className="col-md-12">
                      <div className="alert alert-danger">
                        Email scanning is still work in progress. Check back
                        later for updates.
                      </div>
                    </div>
                  ) : (
                    <div className="col-md-12">
                      {errorMessage.length > 0 && (
                        <ErrorScreen description={errorMessage} />
                      )}
                      {scanStatus === 0 && (
                        <form onSubmit={handleEmailSearch}>
                          <div className="input-group mb-3">
                            <textarea
                              className="form-control"
                              placeholder="Enter email source to scan"
                              value={emailSearchText}
                              onChange={(e) =>
                                setEmailSearchText(e.target.value)
                              }
                              aria-label="Enter email source to scan"
                              aria-describedby="submitButton"
                              rows={5}
                            />
                          </div>
                          <div className="mb-3">
                            <input
                              className="form-control"
                              type="file"
                              id="formFile"
                              accept=".eml"
                              onChange={handleEmailFileChange}
                            />
                          </div>
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-primary float-end"
                              type="submit"
                              id="submitButton"
                            >
                              Scan
                            </button>
                          </div>
                        </form>
                      )}
                      {scanStatus === 1 && <LoadingScan />}
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-md-12">
            <h2 className="subtitle">About</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p>
              <strong>urlcheck</strong> is a tool to scan suspicious links. It
              browses the given URL like any normal user would. It then gives
              you a report of what it found including a screenshot, list of
              network requests and other useful information.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
