import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--cream)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
        {/* Logo / Brand */}
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "1rem",
          }}
        >
          Kaizen Collective
        </p>

        {/* Main Heading */}
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.2,
            marginBottom: "1rem",
          }}
        >
          STRONG Pilates Sales
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "1rem",
            color: "var(--ink-muted)",
            marginBottom: "2.5rem",
            lineHeight: 1.6,
          }}
        >
          Sales intelligence and proposal generation for STRONG Pilates prospects.
        </p>

        {/* CTA */}
        <Link
          href="/prospects/new"
          style={{
            display: "inline-block",
            backgroundColor: "var(--ink)",
            color: "var(--cream)",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            padding: "0.875rem 2rem",
            borderRadius: "4px",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
        >
          + New Prospect
        </Link>
      </div>
    </main>
  );
}
