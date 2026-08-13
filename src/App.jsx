import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Lenis from 'lenis';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { isFirebaseConfigured } from './firebase/config';
import SetupGuide from './components/common/SetupGuide';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.1,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!isFirebaseConfigured) {
    return <SetupGuide />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* SEO Global Meta Tags */}
          <Helmet>
            <title>Fix-It - Find Trusted Artisans Near You</title>
            <meta name="description" content="Connect with verified electricians, plumbers, carpenters, and more near you. Build your artisan business or get quality home services on-demand." />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Fix-It - On-Demand Professional Artisan Services" />
            <meta property="og:description" content="Connect with verified electricians, plumbers, carpenters, and more near you." />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Fix-It - Find Trusted Artisans Near You" />
            <meta name="twitter:description" content="Connect with verified electricians, plumbers, carpenters, and more near you." />
          </Helmet>

          {/* Router Provider */}
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
