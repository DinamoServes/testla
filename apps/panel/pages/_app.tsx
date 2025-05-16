import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { createContext, useState } from 'react';

export const NotificationContext = createContext({ notify: (msg: string) => {} });

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { /* log error */ }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center text-red-700">Something went wrong. Please refresh the page or contact support.</div>;
    }
    return this.props.children;
  }
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const [notification, setNotification] = useState('');
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-0 left-0 bg-white text-blue-700 p-2 z-50">Skip to main content</a>
        <NotificationContext.Provider value={{ notify }}>
          {notification && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-blue-100 text-blue-800 text-center py-2 shadow">{notification}</div>
          )}
          <ErrorBoundary>
            <main id="main-content" role="main" className="max-w-4xl mx-auto px-2 sm:px-4 md:px-8">
              <Component {...pageProps} />
            </main>
          </ErrorBoundary>
        </NotificationContext.Provider>
      </body>
    </html>
  );
} 