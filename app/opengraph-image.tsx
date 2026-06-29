import { ImageResponse } from "next/og"

export const alt = "JobAgent — AI jobs matched to your resume"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.5, opacity: 0.6 }}>
          JobAgent
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 900 }}>
          Find jobs that match who you actually are
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#a3a3a3", maxWidth: 880 }}>
          Upload your resume once. Get scored matches, tailored resumes, and interview prep.
        </div>
      </div>
    ),
    { ...size }
  )
}
