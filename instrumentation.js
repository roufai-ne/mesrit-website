// instrumentation.js — Next.js 16 server/edge instrumentation (GlitchTip via SDK Sentry)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.GLITCHTIP_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.GLITCHTIP_DSN,
      tracesSampleRate: 0,
      debug: false,
    });
  }
}
