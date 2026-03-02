// logCleanupService.js — désactivé (logs gérés par GlitchTip, pas de stockage local)
const logCleanupService = {
  init: async () => {},
  start: async () => {},
  stop: async () => {},
  getStatus: () => ({ enabled: false }),
};

export default logCleanupService;