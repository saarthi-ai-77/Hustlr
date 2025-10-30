import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_ENABLE_ERROR_REPORTING) {
        return null;
      }
      return event;
    },
  });
}

export { Sentry };