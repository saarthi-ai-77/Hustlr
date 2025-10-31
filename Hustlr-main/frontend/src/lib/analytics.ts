// Google Analytics integration
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

export const initGA = () => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);
};

export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  trackEvent('page_view', {
    page_path: pagePath,
  });
};

// Performance monitoring
export const measurePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Core Web Vitals
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onINP(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  });

  // Custom performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        trackEvent('page_load', {
          load_time: perfData.loadEventEnd - perfData.loadEventStart,
          dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          first_paint: performance.getEntriesByName('first-paint')[0]?.startTime,
          first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        });
      }
    }, 0);
  });
};

// User interaction tracking
export const trackUserInteraction = (action: string, category: string, label?: string) => {
  trackEvent('user_interaction', {
    action,
    category,
    label,
  });
};

// Error tracking (complements Sentry)
export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
};

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}