/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useReCaptcha } from "next-recaptcha-v3";
import Title from "../../components/Title";
import axios from "axios";
import LoadingScan from "../../components/LoadingScan";
import ErrorScreen from "../../components/ErrorScreen";
import Link from "next/link";

export default function ScanWebPage() {
  const router = useRouter();
  const urlQuery = router.query.url as string;
  const searchInputRef = useRef<any>(null);
  const [searchText, setSearchText] = useState("");
  const [scanStatus, setScanStatus] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const { executeRecaptcha } = useReCaptcha();

  const handleWebSearch = useCallback(
    async (event: FormEvent | null) => {
      if (event) {
        event.preventDefault();
      }

      const token = await executeRecaptcha("startScanOther");

      const search = searchText.trim();
      setErrorMessage("");
      setScanStatus(1);

      axios
        .post("/api/webscan", { url: search || urlQuery, token })
        .then((res) => {
          setSearchText("");
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
    },
    [executeRecaptcha, router, searchText, urlQuery]
  );

  useEffect(() => {
    setTimeout(() => {
      if (urlQuery) {
        setSearchText(urlQuery);
        handleWebSearch(null);
      }
    }, 1500);
  }, [urlQuery, handleWebSearch]);

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
              Safe way to open suspicious links.
            </p>
          </div>
        </div>

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
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
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
      </main>
    </>
  );
}
