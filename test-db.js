const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_kl1SiFKZch2R@ep-crimson-smoke-azh7ojer-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});
p.$connect().then(() => {
  console.log('CONNECTED OK');
  return p.$queryRaw`SELECT 1 as test`;
}).then(r => {
  console.log('QUERY OK', r);
  return p.$disconnect();
}).catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
