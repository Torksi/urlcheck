import Head from "next/head";

interface TitleProps {
  pageName: string;
}

const Title: React.FC<TitleProps> = ({ pageName }) => {
  if (pageName) {
    return (
      <Head>
        <title>{`${pageName} | urlcheck`}</title>
      </Head>
    );
  }
  return (
    <Head>
      <title>Loading... | urlcheck</title>
    </Head>
  );
};

export default Title;
