import { ThemeProvider } from '../theme/ThemeProvider';
import { StreakProvider } from '../context/streakContext';
import EmotionCacheProvider from '../lib/registry';
import { NotificationProvider } from '../components/Notifications/NotificationProvider';
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
          <StreakProvider>
            <ThemeProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </ThemeProvider>
          </StreakProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
