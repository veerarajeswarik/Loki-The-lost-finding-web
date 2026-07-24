import { createApp } from './app.js';
import { env, logConfigSummary } from './config/env.js';
import { connectDB } from './config/db.js';
import { initFirebaseAdmin } from './config/firebaseAdmin.js';

async function start() {
  logConfigSummary();
  await connectDB();
  initFirebaseAdmin();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[LOKII] API listening on http://localhost:${env.port}`);
    console.log(`[LOKII] Health check: http://localhost:${env.port}/api/health`);
  });
}

start().catch((err) => {
  console.error('[LOKII] Fatal startup error:', err);
  process.exit(1);
});
