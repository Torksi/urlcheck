import "../styles/app.scss";
import type { AppProps } from "next/app";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import axios from "axios";
import { SWRConfig } from "swr";
import Footer from "../components/Footer";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 0,
        revalidateOnReconnect: true,
        refreshInterval: 10000,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
      }}
    >
      <ReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      >
        <div className="container">
          <Component {...pageProps} />
          <hr />
          <Footer />
        </div>
      </ReCaptchaProvider>
    </SWRConfig>
  );
}

export default App;
