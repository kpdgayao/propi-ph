"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "4rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
              500
            </h1>
            <p style={{ marginTop: "1rem", fontSize: "1.25rem", color: "#4b5563" }}>
              Something went wrong
            </p>
            <div style={{ marginTop: "2rem" }}>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
