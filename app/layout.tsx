import "./globals.css";
import { ReduxProvider } from '@/providers/ReduxProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Alumni+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
