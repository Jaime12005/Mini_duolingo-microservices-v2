import app from './app';
import config from './config/env';
import { testConnection } from './db/pool';

const port = config.port;

const startServer = async () => {
  try {
    await testConnection();

    app.listen(port, () => {
      console.log(`Vocabulary Service running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();