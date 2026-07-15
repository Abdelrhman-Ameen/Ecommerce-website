require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db-connect');

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDatabase();
  app.listen(port, () => console.log(`Vellora API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
