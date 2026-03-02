// instrumentation-client.js — Next.js 16 client instrumentation (GlitchTip via SDK Sentry)
import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (process.env.NEXT_PUBLIC_GLITCHTIP_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_GLITCHTIP_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    debug: false,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /^Network Error$/,
      /^ChunkLoadError/,
    ],
  });
}
