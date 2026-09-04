import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { PlaybackProvider } from '@/context/PlaybackContext';
import { FriendsProvider } from '@/context/FriendsContext';
import { CommentsProvider } from '@/context/CommentsContext';
import { ExtensionsProvider } from '@/context/ExtensionsContext';
import { NetflixPreviewModal } from '@/components/modals/NetflixPreviewModal';
import { NetflixHoverPortal } from '@/components/modals/NetflixHoverPortal';
import { FullVideoPlayer } from '@/components/modals/FullVideoPlayer';
import { GoogleAuthModal } from '@/components/modals/GoogleAuthModal';
import { AuthPromptModal } from '@/components/modals/AuthPromptModal';
import { ProfileStrengthModal } from '@/components/modals/ProfileStrengthModal';
import { FriendsModal } from '@/components/modals/FriendsModal';
import { ExtensionsModal } from '@/components/extensions/ExtensionsModal';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Kamui — Stream anime the night it airs',
  description:
    'Kamui is an anime streaming platform: same-day simulcasts, full dub and sub libraries, 4K HDR, offline downloads, zero ads.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=Shippori+Mincho+B1:wght@400;500;600;800&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('kamui_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <FriendsProvider>
                <CommentsProvider>
                  <ExtensionsProvider>
                    <PlaybackProvider>
                      {children}
                      <NetflixPreviewModal />
                      <NetflixHoverPortal />
                      <FullVideoPlayer />
                      <FriendsModal />
                      <GoogleAuthModal />
                      <AuthPromptModal />
                      <ProfileStrengthModal />
                      <ExtensionsModal />
                      <Sidebar />
                    </PlaybackProvider>
                  </ExtensionsProvider>
                </CommentsProvider>
              </FriendsProvider>
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
