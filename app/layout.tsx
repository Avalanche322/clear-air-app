import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Roboto } from "next/font/google";

export const metadata: Metadata = {
  title: "Мапа якості повітря",
  description: "Мапа якості повітря в Україні",
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-custom',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
