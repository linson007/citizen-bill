import { ImageResponse } from "next/og";

export const alt = "MattamUndo — മാറ്റം ഉണ്ടോ?";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#123c69",
          color: "#fbfaf7",
          padding: "64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#fbfaf7",
              color: "#123c69",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            M
          </div>
          MattamUndo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700 }}>
            മാറ്റം ഉണ്ടോ?
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, maxWidth: 900 }}>
            Draft, discuss, and support public bill proposals for Kerala.
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.85 }}>mattamundo.com</div>
      </div>
    ),
    {
      ...size,
    },
  );
}
