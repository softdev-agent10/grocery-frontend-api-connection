
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';

import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from "react-toastify/unstyled";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OneBalance - Smart Grocery POS",
  description: "Modern POS system for smart grocery stores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </body>
    </html>
  );
}

