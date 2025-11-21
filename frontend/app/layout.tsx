
import "./globals.css";
import { AuthProvider } from "../components/AuthContext";
//require("dotenv").config();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
  {/* ...existing code... */}