// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Citizen Guide Kenya - Civic Information Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/webp";

export default function Image() {
  const logoUrl = new URL("../public/logo.webp", import.meta.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f3f2f1",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top blue bar */}
        <div
          style={{
            width: "100%",
            height: 12,
            background: "#003078",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={logoUrl}
              alt="Citizen Guide Kenya"
              width={80}
              height={80}
              style={{
                borderRadius: 8,
                marginRight: 20,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#003078",
                  letterSpacing: 1,
                }}
              >
                CITIZEN GUIDE KENYA
              </div>

              <div
                style={{
                  fontSize: 18,
                  color: "#505a5f",
                  marginTop: 4,
                }}
              >
                Independent Civic Information Directory Portal
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#0b0c0c",
                lineHeight: 1.2,
              }}
            >
              Your Comprehensive Guide to Kenyan Governance
            </div>

            <div
              style={{
                fontSize: 22,
                color: "#505a5f",
                marginTop: 18,
                lineHeight: 1.4,
              }}
            >
              Access the Constitution, Parliamentary Acts, County
              Governments, public institutions, and easy-to-follow guides for
              government services.
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "2px solid #b1b4b6",
              paddingTop: 18,
              fontSize: 16,
            }}
          >
            <div style={{ color: "#505a5f" }}>
              An Independent Democratic Literacy Initiative
            </div>

            <div
              style={{
                color: "#0b0c0c",
                fontWeight: 700,
              }}
            >
              www.citizenguide.ke
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}