import { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0";

import "../styles/globals.css";
import Head from "next/head";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Save The Date. Aug 20 2022." />
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
};

export default App;
