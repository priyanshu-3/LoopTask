import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Set environment
      environment: process.env.NODE_ENV,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
      
      replaysOnErrorSampleRate: 1.0,
      
      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,
      
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers.Cookie;
          }
        }
        
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_ENABLED) {
          return null;
        }
        
        return event;
      },
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}
