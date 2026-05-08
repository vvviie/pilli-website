import { Inter } from "next/font/google";
import "./globals.css";
import FirebaseAuthProvider from "@/components/firebase-auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pilli",
  description: "Clinical prescription tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
      </body>
    </html>
  );
}
