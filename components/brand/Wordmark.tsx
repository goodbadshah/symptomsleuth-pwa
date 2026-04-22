// Thin wrapper around the existing /public/symptomsleuth-wordmark.png asset.
// Do NOT recreate or redraw the logo - it is authored and shipped as-is.
// Usage: <Wordmark /> in AppHeader (renders at 48px height, auto width).
export default function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/symptomsleuth-wordmark.png"
      alt="SymptomSleuth"
      style={{ height: "48px", width: "auto", display: "block" }}
    />
  );
}
