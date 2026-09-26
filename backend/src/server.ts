import { app } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';

const port = ENV.PORT || 5001;

const server = app.listen(port, () => {
  console.log(`🏥 Labsmart Enterprise Backend v2 running on port ${port} (${ENV.NODE_ENV})`);
  console.log(`📡 Endpoints: http://localhost:${port}/api/v1`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
