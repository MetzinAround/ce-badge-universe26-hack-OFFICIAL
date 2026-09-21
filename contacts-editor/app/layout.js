import "./globals.css";

export const metadata = {
  title: "GitHub Universe — Badge Contacts",
  description: "Set and export your GitHub Universe badge contact card over Bluetooth",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/Mona-Sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
