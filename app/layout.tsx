import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BloodChai – Save Lives with Every Drop",
  description:
    "Bangladesh's premier blood donation platform. Find donors, request blood, and help save lives across Bangladesh.",
  keywords: "blood donation, bangladesh, blood bank, donate blood, blood request",
  openGraph: {
    title: "BloodChai – Save Lives with Every Drop",
    description: "Bangladesh's premier blood donation platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a0f0f",
              color: "#f5f0f0",
              border: "1px solid #2d1515",
            },
            success: {
              iconTheme: { primary: "#c62828", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
