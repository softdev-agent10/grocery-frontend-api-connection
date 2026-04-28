
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from "react-toastify/unstyled";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';

import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';

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
          <NotificationProvider>
            {children}
          </NotificationProvider>
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

