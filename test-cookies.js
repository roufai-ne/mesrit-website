// test-cookies.js - Test rapide du système de cookies
const { SecureCookies } = require('./src/lib/secureCookies');

// Simuler les variables d'environnement
process.env.COOKIE_SECRET = 'eb183bc26c6933c734366eef68322c73da63fbf54429f2dcc216de1025c36944';

// Test avec un JWT réel comme celui des logs
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NjhhMzcyMTkyNjBlMzBhM2UzNjUiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU2ODk1Njc5LCJleHAiOjE3NTY4OTY1Nzl9.Xb7R9BSUc4r9Po62x0JwqmZbdtbEcYqkR9AR9L7MMNI';

console.log('🔍 Test du système de cookies sécurisés');
console.log('================================================');

try {
  // Signer le JWT
  const secret = SecureCookies.getSigningSecret();
  console.log('✅ Secret récupéré');
  
  const signedToken = SecureCookies.sign(jwtToken, secret);
  console.log('✅ Token signé:', signedToken.length, 'caractères');
  console.log('   Preview:', signedToken.substring(0, 50) + '...');
  
  // Vérifier la signature
  const unsignedToken = SecureCookies.unsign(signedToken, secret);
  console.log('✅ Token vérifié:', !!unsignedToken);
  console.log('   Match original:', unsignedToken === jwtToken);
  
  if (unsignedToken === jwtToken) {
    console.log('🎉 SUCCESS: Le système de cookies fonctionne correctement !');
  } else {
    console.log('❌ ERREUR: Les tokens ne correspondent pas');
    console.log('   Original :', jwtToken.substring(0, 50) + '...');
    console.log('   Récupéré :', (unsignedToken || 'null').substring(0, 50) + '...');
  }

} catch (error) {
  console.error('❌ ERREUR:', error.message);
}