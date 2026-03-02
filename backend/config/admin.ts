export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60, // 30 jours en secondes
      maxSessionLifespan: 24 * 60 * 60,            // 24h en secondes
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
