import type { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "48px", margin: "0 0 16px" }}>{statusCode || "Error"}</h1>
      <p style={{ color: "#666" }}>
        {statusCode === 404
          ? "Page not found"
          : statusCode
          ? `An error ${statusCode} occurred`
          : "An error occurred"}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
