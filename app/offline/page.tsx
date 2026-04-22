import AppHeader from "@/components/layout/AppHeader";

export default function OfflinePage() {
  return (
    <>
      <AppHeader showStreak={false} />
      <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "0 20px",
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "var(--bg-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          borderRadius: "9999px",
          padding: "2px 10px",
          fontSize: "10px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          backgroundColor: "var(--border)",
          color: "var(--text-secondary)",
          marginBottom: "24px",
        }}
      >
        Offline
      </span>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 400,
          color: "var(--text-primary)",
          lineHeight: 1.25,
          marginBottom: "12px",
        }}
      >
        No connection right now.
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          marginBottom: "32px",
        }}
      >
        Your logs are saved on your device - open the app again once you're
        back online.
      </p>
      </main>
    </>
  );
}
