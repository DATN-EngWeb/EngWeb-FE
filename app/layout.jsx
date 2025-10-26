import { ThemeProvider } from './theme/ThemeProvider';
import './globals.css';

export const metadata = {
  title: 'NENS',
  description: 'No English No Success',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
