// monitoringV2.js — remplacé par GlitchTip (voir sentry.server.config.js)
// Le suivi des erreurs est délégué à @sentry/nextjs pointant sur l'instance GlitchTip.
export const monitoringSystemV2 = {
  start: () => {},
  stop: () => {},
  recordError: () => {},
};

export default monitoringSystemV2;
