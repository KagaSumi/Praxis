const app = require('./app');
const { testConnection } = require('./services/database');

const PORT = 3000;

async function startServer() {
  try {
    await testConnection(10, 3000); // wait until DB is ready
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB connection issues:', err);
    process.exit(1);
  }
}

startServer();
