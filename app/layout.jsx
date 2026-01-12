import { ThemeProvider } from '../theme/ThemeProvider';
import EmotionCacheProvider from '../lib/registry';
import './globals.css';
import './globals-editor.css';

export const metadata = {
  title: 'NENS',
  description: 'No English No Success',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmotionCacheProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
